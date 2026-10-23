# BookLeaf Author Support & Communication Portal — Backend

ES modules (ES6) Node.js/Express API for the BookLeaf technical assignment. The provided dataset is included at `src/data/bookleaf_sample_data.json` (10 authors, 18 books).

## Stack
- Node.js 20+, Express, MongoDB/Mongoose
- JWT authentication, bcrypt password hashing, Zod validation
- Socket.IO for ticket updates
- OpenAI API for ticket classification, priority suggestions and editable response drafts
- Swagger UI at `/api-docs`

## Setup
1. Install Node.js 20+ and MongoDB (local or Atlas).
2. Copy `.env.example` to `.env`; set `MONGODB_URI` and a long random `JWT_SECRET`. Add `OPENAI_API_KEY` for live AI features. Never commit `.env`.
3. Install dependencies: `npm install`
4. Seed the supplied authors/books and demo accounts: `npm run seed`
5. Start: `npm run dev`
6. Open `http://localhost:5000/api/health` and `http://localhost:5000/api-docs`.

### Seed login credentials (development only)
- Admin: `admin@bookleaf.local` / value of `ADMIN_PASSWORD` in `.env` (default `Admin@12345`)
- Each author: email from the supplied JSON / value of `AUTHOR_DEFAULT_PASSWORD` (default `Author@12345`)

These are demo credentials only. Change them before any public deployment. Seed is idempotent: it upserts users/authors/books and does not delete tickets.

## Main routes
All routes are prefixed with `/api`.

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/auth/login` | Public | Login, returns JWT |
| GET | `/auth/me` | Authenticated | Current account |
| GET | `/books/my-books` | Author | Current author's books |
| GET | `/tickets/my-tickets` | Author | Current author's tickets |
| POST | `/tickets` | Author | Create support ticket |
| GET | `/tickets/:id` | Author/Admin | Ticket details and messages; authors can only view their own |
| GET | `/admin/tickets` | Admin | Filter/paginate ticket queue |
| PATCH | `/admin/tickets/:id` | Admin | Update status/category/priority/assignee |
| POST | `/admin/tickets/:id/draft` | Admin | Generate AI response draft (does not send it) |
| POST | `/admin/tickets/:id/reply` | Admin | Send public reply |
| POST | `/admin/tickets/:id/notes` | Admin | Add private internal note |
| GET | `/admin/dashboard` | Admin | Dashboard summary |
| GET | `/health` | Public | Health check |

Swagger/OpenAPI UI: `/api-docs`. Ticket updates are emitted over Socket.IO to `author:<userId>` and `admins` rooms. Connect with `auth: { token: '<JWT>' }`.

## AI design
- Classification, priority and draft generation run server-side. The key is never sent to the browser.
- The prompt includes only the ticket, its relevant book fields, and concise relevant BookLeaf policy context; it does not send the entire database or all ticket history.
- If AI classification fails, a conservative rule-based fallback is used and ticket creation still succeeds. Draft generation returns a manual fallback draft if the provider is unavailable; the response flags `aiGenerated: false`.
- Admins can override AI category and priority and must review/edit drafts before sending.
- Model can be changed with `OPENAI_MODEL`. Keep requests short and avoid unnecessary retries to manage cost.

## Security / implementation notes
- JWT-protected routes and role middleware; author queries are scoped to the authenticated account.
- Passwords are hashed; request bodies validated; rate limiting, Helmet and CORS configured.
- Internal notes are returned only to admins, never included in author-visible ticket messages.
- This is an assignment starter. Before production, configure secure secret management, HTTPS, email/password reset, stronger audit logging, monitoring, and deployment-specific CORS.

## Known scope decisions
- Attachments are accepted as a UI/API metadata placeholder only; binary file storage is not implemented because the assignment says upload is optional.
- Demo accounts share one default author password; use only for local evaluation.
- Seed data is preserved exactly. The app adds a `User` record for authentication and separate `Author`/`Book` records for the supplied business data.
