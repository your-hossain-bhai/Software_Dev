# NextCareer Frontend

React + Vite + Tailwind frontend for NextCareer.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create `.env` in `frontend/`:

```env
VITE_API_URL=http://localhost:5000
```

Do not append `/api`. The app appends `/api` automatically.

3. Start dev server:

```bash
npm run dev
```

## Production (Render Static Site)

Build command:

```bash
npm install && npm run build
```

Publish directory:

```bash
dist
```

Required environment variable:

```env
VITE_API_URL=https://<backend-service>.onrender.com
```

If `VITE_API_URL` is not set, the app falls back to same-origin `/api`.
Use this only when your host reverse-proxies `/api` to backend.

## Quick Verification

1. Register a user from production frontend.
2. Login and verify redirect to dashboard.
3. Open dashboard and ensure API widgets load without CORS errors.
4. Verify profile update and protected routes.
