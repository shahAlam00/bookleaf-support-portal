# BookLeaf Admin Portal — Separate Frontend

Standalone React + Vite app for the **Admin Operations Portal only**. Author screens/routes are not available in this project.

## Features
- Admin-only login through the backend JWT endpoint.
- Operations dashboard and ticket metrics.
- Ticket queue with search, status, priority, category and date filters.
- Ticket detail and conversation.
- AI response draft generation, editing and public replies.
- Status/priority/category changes, assignment and private internal notes.
- Live ticket updates via Socket.IO (with manual refresh fallback).

## Run
1. Ensure the BookLeaf backend is running on port 5000.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` if needed.
4. Run `npm run dev` and open `http://localhost:5174`.

## API configuration
`VITE_API_BASE_URL=http://localhost:5000/api`
`VITE_SOCKET_URL=http://localhost:5000`

Login accepts an account whose backend role is `admin`. Use the admin credentials configured in the backend environment. Backend authorization is the source of truth.

## Backend CORS
Set backend `CLIENT_URL=http://localhost:5173,http://localhost:5174` and restart the backend so both separate portals are allowed.
