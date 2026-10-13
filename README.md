# Local ChatGPT Clone

This repository contains a React/Vite chat interface and an Express API. Chat responses use the Groq API; user accounts and chat history are stored locally in SQLite by default.

## Requirements

- Node.js 22 or newer
- A Groq API key

## Run locally on Windows

1. Copy `backend/.env.example` to `backend/.env` if you do not already have a local environment file. Set `GROQ_API_KEY` to your Groq API key and set `JWT_SECRET` to a long, private value. Keep `.env` private and do not commit it.
2. In a terminal, install and start the API:

   ```powershell
   cd backend
   npm install
   npm run dev
   ```

3. In a second terminal, install and start the web app:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

4. Open the local URL printed by Vite (normally `http://localhost:5173`).

The API runs on `http://localhost:3888` by default. Its health endpoints are `/` and `/api/health`. SQLite creates `backend/data/chat.sqlite` automatically; no separate database service or schema setup is needed. The API returns a clear configuration error if `GROQ_API_KEY` is missing. If port 3888 is already in use, stop the previous backend process before starting the updated API.

The sidebar lists the 10 most recently active saved chats (or fewer when fewer chats exist); select one to reopen its messages.

To use a different API URL, set `VITE_API_URL` for the frontend, including the `/api` suffix. To use MySQL instead of SQLite, set `DB_CLIENT=mysql` in `backend/.env`, create the database, and apply `backend/db/schema.sql` before starting the API. If upgrading an existing MySQL database, add the `conversation_id` column and index from that schema to its `conversations` table.

## Deploy to YegaraHost and Netlify

1. In YegaraHost, create or select the MySQL database and Node.js application. Set the application root to `backend`, the startup file to `index.js`, and install dependencies with `npm install`.
2. Set the backend environment variables in the hosting panel: `DB_CLIENT=mysql`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `GROQ_API_KEY`, `JWT_SECRET`, and `CORS_ORIGIN`. Set `CORS_ORIGIN` to the exact Netlify site origin (scheme and hostname only, without `/`). Do not commit production credentials.
3. Allow the backend database user to alter the existing `conversations` table. On startup, the backend adds `conversation_id` and the history index to older installations if they are missing.
4. In Netlify, connect this repository with base directory `frontend`, build command `npm run build`, and publish directory `dist`. Add `VITE_API_URL` with the full YegaraHost backend API URL, including `/api` (for example, `https://your-backend-host.example/api`).
5. Redeploy the Netlify site after setting `VITE_API_URL`; production builds intentionally fail if that URL is missing to avoid publishing a frontend that calls a visitor's localhost.

## Checks

```powershell
cd frontend
npm run lint
npm run build
```
