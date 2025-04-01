# Calendar App

A sleek calendar application with a modern Tokyo-night inspired theme. Built with Next.js, Go, and SQLite.

## Features

- 📅 Multiple calendar views (Month, Week, 3-Day, Day)
- 🎨 Beautiful Tokyo-night theme with dark mode
- ⚡ Real-time event management
- 🔄 Persistent storage with SQLite database
- 🎯 Intuitive event creation and editing
- ⌨️ Keyboard shortcuts for navigation

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Go (v1.19 or higher)
- SQLite3

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/calendar-app.git
cd calendar-app
```

2. Install frontend dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm run dev
```

4. In a new terminal, start the backend server:
```bash
cd backend
go run cmd/server/main.go
```

The app will be available at `http://localhost:3000`

## Keyboard Shortcuts

- `←` / `→`: Navigate between days
- `T`: Jump to today
- `Esc`: Close modals

## TODO

### AI Chat Integration Plans
1. [x] Set up OpenAI API integration
2. [ ] Fix delete functionality when using chat
3. [ ] Allow chatbot to make multiple changes in one response

### General Improvements
1. [ ] Add recurring events support
2. [ ] Implement event categories/tags
3. [ ] Add event reminders/notifications
4. [ ] Enable calendar sharing
5. [ ] Add multi-user support
6. [ ] Implement drag-and-drop event editing

## License

MIT License - feel free to use this project however you'd like, boss! 😎
