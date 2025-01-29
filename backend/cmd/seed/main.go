package main

import (
	"calendar-backend/internal/models"
	"calendar-backend/internal/repository"
	"log"
	"time"

	"github.com/google/uuid"
)

func main() {
	repository.InitDB()

	// Today's events
	today := time.Now()
	today = time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, today.Location())

	events := []models.Event{
		{
			ID:          uuid.New().String(),
			Title:       "Meet with Don Vito",
			Description: "Discuss new business opportunities",
			Start:       today.Add(10 * time.Hour),
			End:         today.Add(11 * time.Hour),
			Color:       "var(--tokyo-red)",
		},
		{
			ID:          uuid.New().String(),
			Title:       "Lunch at Luigi's",
			Description: "Weekly family gathering",
			Start:       today.Add(12*time.Hour + 30*time.Minute),
			End:         today.Add(14 * time.Hour),
			Color:       "var(--tokyo-blue)",
		},
		{
			ID:          uuid.New().String(),
			Title:       "Check on the 'merchandise'",
			Description: "Inventory check at the warehouse",
			Start:       today.Add(15 * time.Hour),
			End:         today.Add(16 * time.Hour),
			Color:       "var(--tokyo-purple)",
		},
		{
			ID:          uuid.New().String(),
			Title:       "Meeting with the Families",
			Description: "Annual strategic planning",
			Start:       today.Add(24*time.Hour + 14*time.Hour),
			End:         today.Add(24*time.Hour + 16*time.Hour),
			Color:       "var(--tokyo-green)",
		},
		{
			ID:          uuid.New().String(),
			Title:       "Visit Uncle Sal",
			Description: "Important family matters",
			Start:       today.Add(48*time.Hour + 11*time.Hour),
			End:         today.Add(48*time.Hour + 12*time.Hour),
			Color:       "var(--tokyo-cyan)",
		},
	}

	for _, event := range events {
		result := repository.DB.Create(&event)
		if result.Error != nil {
			log.Printf("Error creating event %s: %v\n", event.Title, result.Error)
		} else {
			log.Printf("Created event: %s\n", event.Title)
		}
	}

	log.Println("Seed completed successfully!")
}
