package models

import (
	"time"

	"gorm.io/gorm"
)

type Event struct {
	ID          string         `gorm:"primarykey" json:"id"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Start       time.Time      `json:"start"`
	End         time.Time      `json:"end"`
	Color       string         `json:"color"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
} 