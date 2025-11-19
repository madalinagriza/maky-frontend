# maky-frontend

Vue 3 + TypeScript single-page app powered by Vite. The UI already exposes a simple "Backend status" card that is wired to an Axios-based service layer so future API endpoints can plug in immediately. During local development, Vite proxies `/api` requests to `http://localhost:8000` so the frontend can call the backend without CORS headaches.

## Requirements

- Node.js 18.0+ (Vite 7 requirement)
- npm 10+

## Getting started

Clone the repo, copy the example environment file, install dependencies, and start Vite:

```powershell
cd c:\Users\mgriz\maky-frontend
copy .env.local.example .env.local
npm install
npm run dev
```

The dev server runs on http://localhost:5173 and proxies `/api` to `http://localhost:8000` (see `vite.config.ts`). Adjust `VITE_API_BASE_URL` inside `.env.local` if the backend lives elsewhere.

## API integration structure

- `src/services/apiClient.ts`: shared Axios instance with base URL, JSON headers, and error normalization.
- `src/services/healthService.ts`: sample service calling `/api/health`; replace or extend as real endpoints go live.
- `src/composables/useServerStatus.ts`: Vue composable that handles loading/error state, ready to be reused inside components.
- `src/App.vue`: renders the status card and demonstrates how to trigger service calls from the UI.

Because there are no API routes yet, the button in the UI simply illustrates the flow; once the backend exposes `/api/health` (or any other endpoint) the same structure will surface real data. Add additional files inside `src/services` and `src/composables` to keep API interactions consistent.

## Additional scripts

- `npm run build` – Type-check (`vue-tsc`) and create a production build.
- `npm run preview` – Serve the latest build locally.

## Next steps

1. Flesh out the backend routes under `http://localhost:8000/api`.
2. Map those routes to dedicated service modules in `src/services`.
3. Add unit/e2e tests (Vitest/Cypress) once the API surface stabilizes.
