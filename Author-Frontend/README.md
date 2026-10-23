# BookLeaf Author Portal

The BookLeaf Author Portal provides authors with a central place to view their books, review royalty information, submit support requests, and track responses from the BookLeaf Publishing support team.

## Features

- Author login and protected access.
- View books associated with the authenticated author.
- Review book details and royalty information.
- Create support tickets for a selected book or general query.
- View submitted tickets and their status.
- Read responses from the support team.
- Track support conversations.
- Receive near-real-time updates where configured.

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
cd Author-Frontend
npm install
```

### Environment Variables

Create a `.env` file in this directory:

```env
VITE_API_BASE_URL=https://YOUR-BACKEND-URL/api
VITE_SOCKET_URL=https://YOUR-BACKEND-URL
```

Replace the placeholder with your deployed backend URL.

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

The author frontend is deployed on Vercel.

**Live URL:** Add your Author Portal URL here.

## Authentication and Data Privacy

Authors authenticate through the backend API. The backend must enforce author-level access controls so each author can access only their own books, tickets, and conversations.

## Support Ticket Workflow

1. Sign in to the portal.
2. Select a book or choose the general/account-level option.
3. Enter the subject and query details.
4. Submit the support ticket.
5. Open the ticket to review its status and support-team responses.

## Security

- Never expose API keys or database credentials in frontend code.
- Do not commit `.env` files containing secrets.
- Authorization and data isolation must be enforced by the backend.

## Known Limitations

Document any incomplete features or external-service dependencies that affect the deployed portal.
