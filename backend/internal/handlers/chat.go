package handlers

import (
	"calendar-backend/internal/ai"

	"github.com/gofiber/fiber/v2"
)

type ChatRequest struct {
	Message string `json:"message"`
}

type ChatResponse struct {
	Message string             `json:"message"`
	Action  *ai.CalendarAction `json:"action,omitempty"`
}

func HandleChat(c *fiber.Ctx) error {
	var req ChatRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Query AI with user's message
	message, action, err := ai.QueryOllama(req.Message)
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
