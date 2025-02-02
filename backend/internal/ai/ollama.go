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

IMPORTANT: You MUST respond with a valid JSON object containing a "message" field and optionally an "action" field.
DO NOT include any thinking process or markdown outside the JSON.

Example response format:
{
    "message": "I've added your ballet class to the calendar! The time slot from 2 PM to 3 PM is free.",
    "action": {
        "type": "create",
        "title": "Ballet Class",
        "description": "Weekly dance session",
        "start": "2024-01-31T14:00:00Z",
        "end": "2024-01-31T15:00:00Z"
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
5. Format times in RFC3339 format
6. Check for conflicts before suggesting times

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
	fmt.Printf("Executing calendar action: %+v\n", action)

	switch action.Type {
	case "create":
		event := models.Event{
			ID:          uuid.New().String(),
			Title:       action.Title,
			Description: action.Description,
			Start:       action.Start,
			End:         action.End,
			Color:       "var(--tokyo-purple)", // Add default color
		}
		fmt.Printf("Creating event: %+v\n", event)
		if err := repository.DB.Create(&event).Error; err != nil {
			fmt.Printf("Error creating event: %v\n", err)
			return err
		}
		fmt.Printf("Successfully created event with ID: %s\n", event.ID)
		return nil

	case "update":
		fmt.Printf("Updating event with ID: %s\n", action.EventID)
		result := repository.DB.Model(&models.Event{}).
			Where("id = ?", action.EventID).
			Updates(map[string]interface{}{
				"title":       action.Title,
				"description": action.Description,
				"start":       action.Start,
				"end":         action.End,
			})
		if result.Error != nil {
			fmt.Printf("Error updating event: %v\n", result.Error)
			return result.Error
		}
		fmt.Printf("Successfully updated event. Rows affected: %d\n", result.RowsAffected)
		return nil

	case "delete":
		fmt.Printf("Deleting event with ID: %s\n", action.EventID)
		result := repository.DB.Delete(&models.Event{}, "id = ?", action.EventID)
		if result.Error != nil {
			fmt.Printf("Error deleting event: %v\n", result.Error)
			return result.Error
		}
		fmt.Printf("Successfully deleted event. Rows affected: %d\n", result.RowsAffected)
		return nil

	default:
		err := fmt.Errorf("unknown action type: %s", action.Type)
		fmt.Printf("Error: %v\n", err)
		return err
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
	scanner.Buffer(make([]byte, 1024*1024), 1024*1024) // Increase scanner buffer

	var aiResponse AIResponse
	for scanner.Scan() {
		var streamResp OllamaStreamResponse
		if err := json.Unmarshal(scanner.Bytes(), &streamResp); err != nil {
			continue
		}

		if streamResp.Done {
			fmt.Printf("Full response received: %s\n", fullResponse.String())

			// Clean up the response to extract JSON
			response := fullResponse.String()
			response = strings.TrimSpace(response)

			// If response starts with a thinking process, try to find JSON
			if strings.HasPrefix(response, "<think>") {
				if start := strings.Index(response, "{"); start != -1 {
					if end := strings.LastIndex(response, "}"); end != -1 {
						response = response[start : end+1]
					}
				}
			}

			// Try to parse the cleaned response
			if err := json.Unmarshal([]byte(response), &aiResponse); err != nil {
				fmt.Printf("Failed to parse JSON response: %v\n", err)
				fmt.Printf("Attempted to parse: %s\n", response)

				// If parsing fails, create a simple message response
				aiResponse = AIResponse{
					Message: strings.TrimPrefix(strings.TrimSuffix(response, "</think>"), "<think>"),
				}
			}
		} else {
			fullResponse.WriteString(streamResp.Response)
		}
	}

	if err := scanner.Err(); err != nil {
		return "", nil, fmt.Errorf("error reading response: %v", err)
	}

	fmt.Printf("Parsed AI Response: %+v\n", aiResponse)

	// Execute calendar action if present
	if aiResponse.Action != nil {
		fmt.Printf("Executing calendar action from AI response\n")
		if err := executeCalendarAction(aiResponse.Action); err != nil {
			return "", nil, fmt.Errorf("failed to execute calendar action: %v", err)
		}
	} else {
		fmt.Printf("No calendar action in AI response\n")
	}

	return aiResponse.Message, aiResponse.Action, nil
}
