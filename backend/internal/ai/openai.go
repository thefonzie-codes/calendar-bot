package ai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"
)

type OpenAIProvider struct {
	BaseURL string
	Model   string
	APIKey  string
}

type OpenAIRequest struct {
	Model       string          `json:"model"`
	Messages    []OpenAIMessage `json:"messages"`
	Temperature float64         `json:"temperature"`
}

type OpenAIMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OpenAIResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

func NewOpenAIProvider(baseURL string, model string, apiKey string) *OpenAIProvider {
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

	currentSystemPrompt := strings.Replace(BaseSystemPrompt, "{{.Schedule}}", schedule, 1)
	currentSystemPrompt = strings.Replace(currentSystemPrompt, "{{.CurrentDate}}", time.Now().Format("2006-01-02"), 1)
	currentSystemPrompt = strings.Replace(currentSystemPrompt, "{{.TimeZone}}", timezone, 1)

	request := OpenAIRequest{
		Model: p.Model,
		Messages: []OpenAIMessage{
			{
				Role:    "system",
				Content: currentSystemPrompt,
			},
			{
				Role:    "user",
				Content: prompt,
			},
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
		return "", nil, fmt.Errorf("failed to make request to OpenAI: %v", err)
	}
	defer resp.Body.Close()

	var openAIResp OpenAIResponse
	if err := json.NewDecoder(resp.Body).Decode(&openAIResp); err != nil {
		return "", nil, fmt.Errorf("failed to decode response: %v", err)
	}

	if len(openAIResp.Choices) == 0 {
		return "", nil, fmt.Errorf("no response from OpenAI")
	}

	response := openAIResp.Choices[0].Message.Content
	log.Printf("Full response received: %s\n", response)

	// Try to parse the response as JSON
	var aiResponse AIResponse
	if err := json.Unmarshal([]byte(response), &aiResponse); err != nil {
		log.Printf("Failed to parse JSON response: %v\n", err)
		log.Printf("Attempted to parse: %s\n", response)

		// If parsing fails, create a simple message response
		aiResponse = AIResponse{
			Message: response,
		}
	}

	log.Printf("Parsed AI Response: %+v\n", aiResponse)

	return aiResponse.Message, aiResponse.Action, nil
}
