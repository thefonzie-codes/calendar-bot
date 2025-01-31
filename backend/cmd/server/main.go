package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"calendar-backend/internal/handlers"
	"calendar-backend/internal/repository"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	// Make log messages more visible
	log.SetFlags(log.LstdFlags | log.Lshortfile | log.Llongfile)
	log.SetOutput(os.Stdout) // Explicitly set output to stdout
	log.Println("🚀 Server initialization starting...")

	// Initialize database
	if err := repository.InitDB(); err != nil {
		log.Fatalf("❌ Failed to initialize database: %v", err)
	}
	log.Println("✅ Database initialized successfully")

	// Create Fiber app with custom config
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			log.Printf("❌ Error occurred: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

	// Add middleware
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${method} ${path}\n",
	}))
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

	// Add chat endpoint
	api.Post("/chat", handlers.HandleChat)

	// Add basic health check endpoint
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Server is running! Try /api/events")
	})

	// Graceful shutdown setup
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)

	go func() {
		<-c
		log.Println("👋 Gracefully shutting down...")
		_ = app.Shutdown()
	}()

	// Start server
	port := ":8080"
	log.Printf("🌟 Server starting on http://localhost%s", port)
	if err := app.Listen(port); err != nil {
		log.Printf("❌ Server error: %v", err)
	}
}
