# BookLeaf Admin Portal

The BookLeaf Admin Portal is an internal support management dashboard for the BookLeaf Publishing team. It helps administrators manage author support tickets, review AI-generated response drafts, and communicate with authors.

## Features

- Admin authentication and protected access.
- Dashboard for support operations.
- View and filter author support tickets.
- Review ticket details, category, priority, and status.
- Generate AI-assisted response drafts.
- Edit and send replies to authors.
- Add internal notes that are not visible to authors.
- Update ticket status, priority, and category.
- View related author and book information.

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- REST API
- Socket.IO, where configured

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- A running BookLeaf backend API

### Installation

```bash
cd Admin-Frontend
npm install
```

### Environment Variables

Create a `.env` file in this directory:

```env
VITE_API_BASE_URL=https://YOUR-BACKEND-URL/api
VITE_SOCKET_URL=https://YOUR-BACKEND-URL
```

Replace the placeholder with the deployed backend URL.

### Run Locally

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

The production build is generated in the `dist` directory.

## Deployment

The admin frontend is deployed on Vercel.

**Live URL:** Add your Admin Portal URL here.

## Authentication

The portal uses the backend authentication API. Administrative routes and operations require valid authentication and administrator permissions.

## AI-Assisted Support

Administrators can generate response drafts for support tickets, review and edit the suggested text, and send the final response to the author. AI availability depends on the backend configuration and configured LLM provider.

## Security

- API keys and database credentials must remain on the backend.
- Environment files containing secrets must not be committed.
- Backend authorization must be enforced for administrative operations.

## Known Limitations

Document any features that are incomplete, unavailable in the deployed environment, or dependent on external services.
