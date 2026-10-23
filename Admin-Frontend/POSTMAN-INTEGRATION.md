# Frontend ↔ Backend integration map

The frontend expects the backend from `bookleaf-support-backend` to run on port `5000`.

| UI | Method | API path |
|---|---|---|
| Login | POST | `/api/auth/login` |
| Session check | GET | `/api/auth/me` |
| Author profile | GET | `/api/authors/me` |
| Author books | GET | `/api/books/my-books` |
| Author tickets | GET | `/api/tickets/my-tickets` |
| Create ticket | POST | `/api/tickets` |
| Ticket detail | GET | `/api/tickets/:id` |
| Admin dashboard | GET | `/api/tickets/admin/dashboard` |
| Admin queue | GET | `/api/tickets/admin/tickets` |
| Update ticket | PATCH | `/api/tickets/admin/tickets/:id` |
| Generate draft | POST | `/api/tickets/admin/tickets/:id/draft` |
| Send reply | POST | `/api/tickets/admin/tickets/:id/reply` |
| Add internal note | POST | `/api/tickets/admin/tickets/:id/notes` |

All protected requests send `Authorization: Bearer <JWT>`. The UI never calls the LLM provider directly. Socket.IO listens for `ticket:created`, `ticket:updated`, and `ticket:message` events with the session token in `auth.token`.
