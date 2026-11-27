# Vercel Deployment

## Vercel project settings

1. Import the repository into Vercel and set **Root Directory** to `frontend`.
2. Use the Next.js framework preset and Node.js 20.x.
3. The frontend uses the deployed FastAPI origin `https://nextapi.vpnpro.in`; production browser requests use the same-origin `/backend-api` proxy. The backend host is pinned in the frontend so an old `NEXT_PUBLIC_API_URL` value cannot route requests back to a frontend alias such as `https://api.intervai.vpnpro.in`. No API URL environment variable is needed.
4. Deploy. `vercel.json` uses `npm ci` and `npm run build`. The build packages `public/buddy-extension.zip` with the same backend origin.

Gemini credentials and other server secrets belong on the backend only.

## Backend and Firebase

- Set the backend's `FRONTEND_ORIGIN` to the deployed frontend origin `https://intervai.vpnpro.in`. The current FastAPI CORS configuration permits this one configured origin plus localhost; Vercel preview domains will not be able to call the API unless the backend CORS policy is extended to allow them.
- Add the production frontend hostname to Firebase Authentication's **Authorized domains**. Add a Vercel preview hostname only if preview deployments need Firebase authentication.
- Confirm the deployed API is reachable over HTTPS and its auth, onboarding, and other required routes are available before testing the frontend.
- Configure backend `SMTP_USER` and `SMTP_PASSWORD` so successful sign-ins can queue the HTML account-security notification email. `SMTP_HOST`, `SMTP_PORT`, and `ADMIN_EMAIL` can override the existing mail defaults.

Firebase's public web configuration is currently defined in `lib/firebase/config.ts`; no Firebase client environment variables are required by the frontend at build time.

## Local production checks

From `frontend`, run:

```sh
npm ci
npm run lint
npx tsc --noEmit
npm run build
```
