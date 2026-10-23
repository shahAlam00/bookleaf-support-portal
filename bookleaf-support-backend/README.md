# BookLeaf Support Portal — Backend API

## Overview

The BookLeaf Support Portal Backend is a REST API for an author support and communication platform. It provides authentication, author and book data access, support ticket management, ticket replies, internal notes, and AI-assisted ticket classification and response drafting.

The backend supports two roles: **Admin** and **Author**. Authorization rules control access to administrative operations and author-specific resources.

## Features

- User authentication and role-based authorization.
- JWT-based authentication.
- Password hashing using bcrypt.
- Author profile and book information APIs.
- Author-specific book and ticket access.
- Support ticket creation and management.
- Ticket status, category, and priority updates.
- Public replies to authors.
- Private internal notes for support staff.
- AI-assisted ticket classification and priority suggestions.
- AI-generated reply drafts with rule-based/manual fallback.
- MongoDB data persistence using Mongoose.
- Request validation using Zod.
- Rate limiting, security headers, and request logging.
- API documentation using Swagger UI and OpenAPI.
- Socket.IO support for authenticated real-time ticket updates, where supported by the deployment environment.

## Technology Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- Zod
- OpenAI SDK with Gemini API compatibility
- Socket.IO
- Swagger UI / OpenAPI
- Helmet, CORS, Morgan, and express-rate-limit

## Project Structure

```text
bookleaf-support-backend/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   ├── data/
│   ├── middleware/
│   ├── modules/
│   │   ├── users/
│   │   ├── authors/
│   │   ├── books/
│   │   ├── tickets/
│   │   └── ai/
│   ├── scripts/
│   ├── utils/
│   ├── app.js
│   └── server.js
├── openapi.yaml
├── package.json
├── .env.example
└── README.md
```

## Prerequisites

- Node.js 20 or later
- npm
- A MongoDB database
- A Gemini API key if using live Gemini-powered AI features

## Installation

From the repository root:

```bash
cd bookleaf-support-backend
npm install
```

## Environment Configuration

Create a `.env` file in the backend directory. Use `.env.example` as a reference.

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret_at_least_32_characters
JWT_EXPIRES_IN=1d
BCRYPT_ROUNDS=12

OPENAI_API_KEY=your_gemini_api_key
OPENAI_MODEL=your_supported_gemini_model
OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/

ADMIN_NAME=BookLeaf Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_this_password
AUTHOR_DEFAULT_PASSWORD=change_this_password
```

**Important:** Environment variable names must match the backend's `src/config/env.js` implementation. Configure the Gemini-compatible `baseURL` in the AI client if required by your implementation. Never commit the actual `.env` file or real credentials.

## Running the Backend

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Syntax checks:

```bash
npm run check
```

Seed the database, if needed:

```bash
npm run seed
```

Run the seed script only when appropriate for the target database. Review its behavior before running it against production data.

## API Base URL

Local development:

```text
http://localhost:5000
```

Production:

```text
YOUR_DEPLOYED_BACKEND_URL
```

Health check:

```http
GET /
```

The health endpoint returns an API health status and timestamp.

## API Modules

| Module | Purpose |
|---|---|
| `/api/auth` | Authentication and current-user information |
| `/api/authors` | Author profile and related operations |
| `/api/books` | Book information and author book listings |
| `/api/tickets` | Ticket creation, ticket retrieval, replies, notes, and administration |

For exact request schemas, response examples, and supported endpoints, refer to `openapi.yaml` and the route implementations.

## Authentication and Authorization

Protected endpoints use JWT authentication. The backend identifies the authenticated user and checks their role before allowing access to protected operations.

- Admins can access authorized ticket-management operations.
- Authors can access only resources permitted for their account.
- Passwords are hashed before storage.
- Invalid or expired tokens should be rejected.

## AI Integration

The AI module supports two main operations:

1. **Ticket classification:** suggests a category and priority using ticket details and the configured knowledge base.
2. **Reply drafting:** generates a suggested response for an administrator to review and edit before sending.

If the AI provider is unavailable or the API key is not configured, the backend can return rule-based classification or a manual fallback draft.

AI-generated responses must be reviewed by an administrator before being sent to an author. AI availability depends on provider configuration, quotas, and deployment settings.

## Security Considerations

- Keep database credentials, JWT secrets, and AI API keys in environment variables.
- Restrict CORS to trusted frontend origins.
- Validate incoming requests.
- Apply authentication and role checks to protected endpoints.
- Avoid exposing private internal notes to authors.
- Do not log passwords, access tokens, or API keys.
- Use HTTPS for deployed applications.

## Deployment

The backend is deployed separately from the React frontend.

**Production API URL:** Add your actual deployed backend URL.

Configure the production environment variables in the hosting provider's dashboard. Verify the database connection, authentication endpoints, CORS configuration, and AI integration after deployment.

## Testing

Recommended verification steps:

1. Check the health endpoint.
2. Test valid and invalid login credentials.
3. Verify admin and author permissions.
4. Confirm authors can access only their own books and tickets.
5. Create a ticket and verify its category and priority.
6. Generate an AI draft and check whether the provider actually generated it or a fallback was used.
7. Send an admin reply and verify the author can see it.
8. Verify internal notes remain private.
9. Test validation errors and unavailable AI-provider behavior.

## API Documentation

If Swagger UI is enabled in the deployed environment, access it at:

```text
YOUR_DEPLOYED_BACKEND_URL/api-docs
```

The OpenAPI specification is maintained in `openapi.yaml`.

## License

This project was developed as part of a Full Stack Developer technical assignment for BookLeaf Publishing.
