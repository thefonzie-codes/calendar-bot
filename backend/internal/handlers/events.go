package handlers

import (
	"calendar-backend/internal/models"
	"calendar-backend/internal/repository"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func GetEvents(c *fiber.Ctx) error {
	var events []models.Event
	result := repository.DB.Find(&events)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch events",
		})
	}
	log.Printf("Fetched %d events", len(events))
	return c.JSON(events)
}

func CreateEvent(c *fiber.Ctx) error {
	event := new(models.Event)
	if err := c.BodyParser(event); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse request body",
		})
	}

	event.ID = uuid.New().String()
	result := repository.DB.Create(&event)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create event",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(event)
}

func UpdateEvent(c *fiber.Ctx) error {
	id := c.Params("id")
	event := new(models.Event)

	if err := c.BodyParser(event); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse request body",
		})
	}

	result := repository.DB.Model(&models.Event{}).Where("id = ?", id).Updates(event)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update event",
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Event not found",
		})
	}

	return c.JSON(event)
}

func DeleteEvent(c *fiber.Ctx) error {
	id := c.Params("id")

	result := repository.DB.Delete(&models.Event{}, "id = ?", id)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete event",
		})
	}

	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Event not found",
		})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
