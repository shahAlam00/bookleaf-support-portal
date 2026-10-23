# BookLeaf Author Portal — Separate Frontend

Standalone React + Vite app for the **Author Portal only**. Admin screens/routes are not available in this project.

## Features
- Author-only login through the backend JWT endpoint.
- Overview with book, royalty and ticket summaries.
- My Books: publication details, sales and royalty figures from the API.
- Raise support tickets and view ticket history/conversations.
- Live ticket updates via Socket.IO (with manual refresh fallback).

## Run
1. Ensure the BookLeaf backend is running on port 5000.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` if needed.
4. Run `npm run dev` and open `http://localhost:5173`.

## API configuration
`VITE_API_BASE_URL=http://localhost:5000/api`
`VITE_SOCKET_URL=http://localhost:5000`

Login accepts an account whose backend role is `author`. Use an email from the supplied sample JSON and the author password configured in the backend seed/environment. Backend authorization is the source of truth.

## Backend CORS
If running both separate portals, set backend `CLIENT_URL=http://localhost:5173,http://localhost:5174` and restart the backend.
