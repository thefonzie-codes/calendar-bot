package main

import (
	"log"

	"calendar-backend/internal/handlers"
	"calendar-backend/internal/repository"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	// Initialize database
	repository.InitDB()

	// Create Fiber app
	app := fiber.New()

	// Add middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000",
		AllowHeaders: "Origin, Content-Type, Accept",
		AllowMethods: "GET, POST, PUT, DELETE",
	}))

	// Setup routes
	api := app.Group("/api")
	events := api.Group("/events")

	events.Get("/", handlers.GetEvents)
	events.Post("/", handlers.CreateEvent)
	events.Put("/:id", handlers.UpdateEvent)
	events.Delete("/:id", handlers.DeleteEvent)

	// Start server
	log.Fatal(app.Listen(":8080"))
}
