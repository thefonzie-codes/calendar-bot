package repository

import (
	"calendar-backend/internal/models"
	"fmt"
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() error {
	var err error
	log.Println("Initializing database...")

	// Enable GORM logging for debugging
	config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	DB, err = gorm.Open(sqlite.Open("calendar.db"), config)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %v", err)
	}

	// Enable foreign key constraints
	if err := DB.Exec("PRAGMA foreign_keys = ON").Error; err != nil {
		return fmt.Errorf("failed to enable foreign keys: %v", err)
	}

	// Auto migrate the schema
	log.Println("Migrating database schema...")
	if err := DB.AutoMigrate(&models.Event{}); err != nil {
		return fmt.Errorf("failed to migrate database: %v", err)
	}

	// Test database connection
	var count int64
	if err := DB.Model(&models.Event{}).Count(&count).Error; err != nil {
		return fmt.Errorf("failed to query database: %v", err)
	}
	log.Printf("Database initialized successfully. Current event count: %d\n", count)

	return nil
}
