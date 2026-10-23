# Manual API Test Checklist

1. `npm run seed`; start API with `npm run dev`.
2. `GET /api/health` returns 200.
3. `POST /api/auth/login` as an author returns a token and role `author`.
4. `GET /api/books/my-books` returns only books mapped to that author's `authorId`.
5. Create a ticket with `POST /api/tickets`; verify it persists even without `OPENAI_API_KEY`.
6. Login as admin; list/filter tickets, generate a draft, add an internal note, change priority/status and send a public reply.
7. Confirm author can see public replies but not internal notes.
8. Confirm author cannot read another author's ticket or access admin routes.
9. Confirm authenticated Socket.IO clients receive ticket events.
