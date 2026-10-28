# Task Manager (MERN)

Create, edit, complete, filter, search and delete tasks. MongoDB + Express + React (Vite) + Node.

## Run it

```bash
npm run install:all
npm run server   # terminal 1 -> API on http://localhost:5050
npm run client   # terminal 2 -> UI  on http://localhost:5173
```

No MongoDB install needed: without `MONGODB_URI` the server starts an embedded MongoDB
and stores data in `server/.data` (first run downloads the mongod binary).
To use your own database, copy `server/.env.example` to `server/.env`.

## API

| Method | Path | Notes |
|---|---|---|
| GET | `/api/tasks?status=&priority=&q=` | filter + title search, newest first |
| POST | `/api/tasks` | `title` required |
| PATCH | `/api/tasks/:id` | partial update |
| DELETE | `/api/tasks/:id` | |

Task: `title`, `description`, `status` (todo / in-progress / done), `priority` (low / medium / high), `dueDate`.

## Key decisions

1. **Filtering and search happen on the server**, so the UI stays correct as the list grows (no loading everything client-side).
2. **Whitelisted fields + schema validation on the server**; the client is never trusted. Invalid ids, enums and empty titles return clear 400s that the UI shows in a banner.
3. **Zero-setup database**: embedded MongoDB fallback so a reviewer can run the app with two commands.

## Deliberately not implemented

1. **Authentication / multi-user accounts** - adds a large surface (sessions, hashing, authorization) without demonstrating task-management logic; the data model is easy to extend with an `owner` field.
2. **Drag-and-drop kanban board** - a status dropdown covers the same need with far less code and better accessibility; DnD is polish, not core.
3. **Real-time sync (WebSockets) and notifications** - single-user app, so there is no concurrent-editing problem worth the complexity.

## Known limitation (what I'd fix with one more day)

After every mutation the client **refetches the whole list** rather than updating state optimistically. It is simple and always consistent, but costs a round trip per click and makes toggles feel slightly laggy on slow networks. With a day, I'd add optimistic updates with rollback on error, plus pagination. Automated tests (API + component) would be next.
