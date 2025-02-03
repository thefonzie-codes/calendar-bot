package ai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type OpenAIProvider struct {
	BaseURL string
	Model   string
	APIKey  string
}

type OpenAIMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OpenAIRequest struct {
	Model       string          `json:"model"`
	Messages    []OpenAIMessage `json:"messages"`
	Temperature float64         `json:"temperature"`
}

type OpenAIResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

func NewOpenAIProvider(baseURL, model, apiKey string) *OpenAIProvider {
	return &OpenAIProvider{
		BaseURL: baseURL,
		Model:   model,
		APIKey:  apiKey,
	}
}

func (p *OpenAIProvider) Query(prompt string, timezone string) (string, *CalendarAction, error) {
	schedule, err := GetFormattedSchedule()
	if err != nil {
		return "", nil, fmt.Errorf("failed to get schedule: %v", err)
	}

	currentSystemPrompt := fmt.Sprintf(`You are a helpful calendar assistant. You can help users manage their schedule, 
create events, and provide suggestions about time management. Please provide concise and practical responses.

Once you create the events, ask the user if it is correct. If it is not, ask the user for the changes they would like to make.

IMPORTANT: The current date is %s and the user's time zone is %s. The user will give their event times in their local time zone.  
Convert these times to UTC and respond with the UTC times. For example, if the user says "I have a meeting at 2 PM" and their time zone is EST, 
convert that to UTC by adding 5 hours (since EST is UTC-5). So the UTC time would be 7:00 PM.  Therefore the start time would be 2025-01-02T19:00:00Z and the end time would be 2025-01-02T20:00:00Z.

IMPORTANT: You MUST respond with a valid JSON object containing a "message" field and optionally an "action" field.
DO NOT include any thinking process or markdown outside the JSON.

IMPORTANT: All events must be in the future.

Example response formats:

For simple responses (no calendar action):
{
    "message": "Your next meeting is at 2 PM today!",
    "action": {
        "type": "response"
    }
}

For calendar modifications:
{
    "message": "I've added your ballet class to the calendar! The time slot from 2 PM to 3 PM is free.",
    "action": {
        "type": "create",
        "title": "Ballet Class",
        "description": "Weekly dance session",
        "start": "2025-01-31T14:00:00Z",
        "end": "2025-01-31T15:00:00Z"
    }
}

When responding to schedule-related queries:
1. Format messages in markdown (inside the JSON "message" field)
2. Use bullet points for time slots
3. Highlight important events or conflicts
4. Keep responses concise but informative

When modifying the calendar:
1. Always include both "message" and "action" fields in your JSON response
2. Set action "type" to one of: "create", "update", or "delete"
3. Include all necessary event details (title, description, start, end times)
4. For updates and deletions, include the event_id
5. Format times in RFC3339 format with 'Z' suffix for UTC times
6. Check for conflicts before suggesting times

Current Schedule:
%s`, time.Now().Format("2006-01-02"), timezone, schedule)

	request := OpenAIRequest{
		Model: p.Model,
		Messages: []OpenAIMessage{
			{Role: "system", Content: currentSystemPrompt},
			{Role: "user", Content: prompt},
		},
		Temperature: 0.7,
	}

	jsonData, err := json.Marshal(request)
	if err != nil {
		return "", nil, fmt.Errorf("failed to marshal request: %v", err)
	}

	req, err := http.NewRequest("POST", p.BaseURL+"/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", nil, fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+p.APIKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", nil, fmt.Errorf("failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", nil, fmt.Errorf("OpenAI API returned status code %d", resp.StatusCode)
	}

	var openAIResp OpenAIResponse
	if err := json.NewDecoder(resp.Body).Decode(&openAIResp); err != nil {
		return "", nil, fmt.Errorf("failed to decode response: %v", err)
	}

	if len(openAIResp.Choices) == 0 {
		return "", nil, fmt.Errorf("no response choices returned")
	}

	content := openAIResp.Choices[0].Message.Content

	// Parse the response as JSON
	var aiResponse AIResponse
	if err := json.Unmarshal([]byte(content), &aiResponse); err != nil {
		// If parsing fails, wrap the content in our own JSON structure
		aiResponse = AIResponse{
			Message: content,
			Action: &CalendarAction{
				Type: "response",
			},
		}
	}

	// Execute calendar action if present
	if aiResponse.Action != nil {
		if err := executeCalendarAction(aiResponse.Action); err != nil {
			return "", nil, fmt.Errorf("failed to execute calendar action: %v", err)
		}
	}

	return aiResponse.Message, aiResponse.Action, nil
}
