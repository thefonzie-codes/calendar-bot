package main

import (
	"calendar-backend/internal/models"
	"calendar-backend/internal/repository"
	"log"
	"time"
)

func main() {
	repository.InitDB()

	// Today's events
	today := time.Now()
	today = time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, today.Location())

	events := []models.Event{
		// ... (event definitions)
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
