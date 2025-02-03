package handlers

import (
	"calendar-backend/internal/ai"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
)

type ChatRequest struct {
	Message  string `json:"message"`
	Timezone string `json:"timezone"`
}

type ChatResponse struct {
	Message string             `json:"message"`
	Action  *ai.CalendarAction `json:"action,omitempty"`
}

var (
	aiProvider ai.AIProvider
)

func InitAIProvider() {
	// Check if OpenAI API key is set
	apiKey := os.Getenv("OPENAI_API_KEY")
	log.Printf("🔑 OpenAI API Key present: %v", apiKey != "")
	log.Printf("🔑 OpenAI API Key length: %d", len(apiKey))

	if apiKey != "" && apiKey != "your_api_key_here" {
		log.Println("🤖 Using OpenAI Provider")
		aiProvider = ai.NewOpenAIProvider(
			"https://api.openai.com",
			"gpt-3.5-turbo",
			apiKey,
		)
	} else {
		log.Printf("🤖 Falling back to Ollama Provider (API Key empty or not set: %v)", apiKey == "")
		// Fallback to Ollama
		aiProvider = ai.NewOllamaProvider(
			"http://127.0.0.1:11434",
			"deepseek-r1:8b",
		)
	}
}

func HandleChat(c *fiber.Ctx) error {
	var req ChatRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Query AI with user's message and timezone
	message, action, err := aiProvider.Query(req.Message, req.Timezone)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Return formatted response
	return c.JSON(ChatResponse{
		Message: message,
		Action:  action,
	})
}
