# Architecture Notes

- `modules/` keeps domain code together: model, validation, service, controller, and routes.
- `middleware/` handles authentication, role checks, validation, 404s and consistent errors.
- `modules/ai/` isolates AI provider integration and the assignment-provided Knowledge Base.
- `scripts/seed.js` imports the supplied 10-author/18-book JSON and creates demo login accounts.
- Ticket messages are stored separately from ticket records. Internal notes live on the ticket and are excluded from author responses.
- Socket.IO uses authenticated rooms: `author:<userId>` and `admins`.
