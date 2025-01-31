package ai

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"calendar-backend/internal/models"
	"calendar-backend/internal/repository"

	"github.com/google/uuid"
)

type OllamaRequest struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
	System string `json:"system"`
	Stream bool   `json:"stream"`
}

type OllamaStreamResponse struct {
	Response   string `json:"response"`
	Done       bool   `json:"done"`
	DoneReason string `json:"done_reason,omitempty"`
}

type CalendarAction struct {
	Type        string    `json:"type"` // "create", "update", or "delete"
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Start       time.Time `json:"start"`
	End         time.Time `json:"end"`
	EventID     string    `json:"event_id,omitempty"` // For update/delete
}

type AIResponse struct {
	Message string          `json:"message"` // The text response
	Action  *CalendarAction `json:"action"`  // Optional calendar action
}

const systemPrompt = `You are a helpful calendar assistant. You can help users manage their schedule, 
create events, and provide suggestions about time management. Please provide concise and practical responses.

When responding to schedule-related queries:
1. Always check the current schedule first
2. Format your responses in a clear, structured way using markdown
3. Use bullet points or tables for time slots
4. Highlight important events or conflicts
5. Keep responses concise but informative
6. Use emojis sparingly to improve readability

When suggesting times for meetings:
1. Consider common business hours (9 AM - 5 PM)
2. Check for conflicts with existing events
3. Suggest specific time slots that are available

When modifying the calendar:
1. Return a JSON action object with the appropriate type ("create", "update", or "delete")
2. Include all necessary event details (title, description, start, end times)
3. For updates and deletions, include the event_id
4. Format times in RFC3339 format
5. Check for conflicts before suggesting times

Example actions:
{
  "message": "I'll add that meeting for you!",
  "action": {
    "type": "create",
    "title": "Team Meeting",
    "description": "Weekly sync",
    "start": "2024-01-31T14:00:00Z",
    "end": "2024-01-31T15:00:00Z"
  }
}

Current Schedule:
{{.Schedule}}`

type EventInfo struct {
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Start       time.Time `json:"start"`
	End         time.Time `json:"end"`
}

func GetFormattedSchedule() (string, error) {
	var events []EventInfo
	if err := repository.DB.Model(&models.Event{}).Find(&events).Error; err != nil {
		return "", fmt.Errorf("failed to fetch events: %v", err)
	}

	var schedule strings.Builder
	schedule.WriteString("Here are the current events:\n")

	for _, event := range events {
		schedule.WriteString(fmt.Sprintf("- %s: %s to %s (%s)\n",
			event.Title,
			event.Start.Format("Mon Jan 2 3:04 PM"),
			event.End.Format("3:04 PM"),
			event.Description))
	}

	return schedule.String(), nil
}

func executeCalendarAction(action *CalendarAction) error {
	switch action.Type {
	case "create":
		event := models.Event{
			ID:          uuid.New().String(),
			Title:       action.Title,
			Description: action.Description,
			Start:       action.Start,
			End:         action.End,
		}
		return repository.DB.Create(&event).Error

	case "update":
		return repository.DB.Model(&models.Event{}).
			Where("id = ?", action.EventID).
			Updates(map[string]interface{}{
				"title":       action.Title,
				"description": action.Description,
				"start":       action.Start,
				"end":         action.End,
			}).Error

	case "delete":
		return repository.DB.Delete(&models.Event{}, "id = ?", action.EventID).Error

	default:
		return fmt.Errorf("unknown action type: %s", action.Type)
	}
}

func QueryOllama(prompt string) (string, *CalendarAction, error) {
	url := "http://127.0.0.1:11434/api/generate"

	schedule, err := GetFormattedSchedule()
	if err != nil {
		return "", nil, fmt.Errorf("failed to get schedule: %v", err)
	}

	currentSystemPrompt := strings.Replace(systemPrompt, "{{.Schedule}}", schedule, 1)

	request := OllamaRequest{
		Model:  "deepseek-r1:8b",
		Prompt: prompt,
		System: currentSystemPrompt,
		Stream: true,
	}

	jsonData, err := json.Marshal(request)
	if err != nil {
		return "", nil, fmt.Errorf("failed to marshal request: %v", err)
	}

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", nil, fmt.Errorf("failed to make request to Ollama: %v", err)
	}
	defer resp.Body.Close()

	var fullResponse strings.Builder
	scanner := bufio.NewScanner(resp.Body)

	var aiResponse AIResponse
	for scanner.Scan() {
		var streamResp OllamaStreamResponse
		if err := json.Unmarshal(scanner.Bytes(), &streamResp); err != nil {
			continue
		}

		// Try to parse the response as JSON
		if streamResp.Done {
			if err := json.Unmarshal([]byte(fullResponse.String()), &aiResponse); err != nil {
				// If it's not valid JSON, treat it as a plain message
				aiResponse = AIResponse{
					Message: fullResponse.String(),
				}
			}
		} else {
			fullResponse.WriteString(streamResp.Response)
		}
	}

	if err := scanner.Err(); err != nil {
		return "", nil, fmt.Errorf("error reading response: %v", err)
	}

	// Execute calendar action if present
	if aiResponse.Action != nil {
		if err := executeCalendarAction(aiResponse.Action); err != nil {
			return "", nil, fmt.Errorf("failed to execute calendar action: %v", err)
		}
	}

	return aiResponse.Message, aiResponse.Action, nil
}
