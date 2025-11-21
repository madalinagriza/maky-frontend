# maky-frontend

Vue 3 + TypeScript single-page app powered by Vite. The landing screen now contains an authentication playground that speaks to the `UserAccount` endpoints described in `API_SPEC.md`, allowing you to register and log in against a local or deployed backend. During local development, Vite proxies `/api` requests to `http://localhost:8000` so the frontend can call the backend without CORS headaches.

## Requirements

- Node.js 18.0+ (Vite 7 requirement)
- npm 10+

## Getting started

Clone the repo, optionally copy the example environment file (only needed if you want to override the default proxy), install dependencies, and start Vite:

```powershell
cd c:\Users\mgriz\maky-frontend
copy .env.local.example .env.local
npm install
npm run dev
```

The dev server runs on http://localhost:8080 and proxies `/api` to `http://localhost:8000` (see `vite.config.ts`). Adjust `VITE_API_BASE_URL` inside `.env.local` if the backend lives elsewhere, though the default `/api` fallback is usually enough.

## API integration structure

- `src/services/apiClient.ts`: shared Axios instance with base URL, JSON headers, and consistent error handling.
- `src/services/userAccountService.ts`: thin wrappers around each `/api/UserAccount/*` endpoint (register, login, changePassword, etc.).
- `src/types/userAccount.ts`: request/response payload contracts mirrored from `API_SPEC.md`.
- `src/App.vue`: the authentication UI that switches between Register and Login, talks to the service layer, and surfaces success/error feedback.

Use `VITE_API_BASE_URL` when deploying (Render instructions below); locally, the Axios client defaults to `/api`, which the dev server proxies to `http://localhost:8000`.

## Using the auth playground

1. Run the backend that implements the `UserAccount` endpoints (see `API_SPEC.md`).
2. Start the frontend (`npm run dev`) and open http://localhost:8080.
3. Choose **Register** or **Log in**, fill out the form, and submit. The page shows a success toast with the returned user identifier or an error message bubbled up from the API.
4. Extend the UI by importing other helpers from `userAccountService.ts` (change password, update credentials, etc.).

## Additional scripts

- `npm run build` – Type-check (`vue-tsc`) and create a production build.
- `npm run preview` – Serve the latest build locally.

## Deploying to Render

1. Commit and push your changes so Render can pull the latest `main` branch.
2. In the Render dashboard for this frontend, navigate to **Manage → Environment** and add a new variable: `VITE_API_BASE_URL=https://your-backend.onrender.com/api` (replace with your backend URL).
3. Redeploy the frontend. When Render builds the site, Vite injects this variable so `apiClient` now points at the deployed backend. Locally, the value is typically undefined, so the code falls back to `/api`, letting Vite's dev proxy continue to target `http://localhost:8000`.

## Next steps

1. Flesh out the remaining backend routes under `http://localhost:8000/api`.
2. Add more frontend flows (change password, update credentials, delete account) by importing helpers from `src/services/userAccountService.ts`.
3. Add unit/e2e tests (Vitest/Cypress) as the API surface stabilizes.
