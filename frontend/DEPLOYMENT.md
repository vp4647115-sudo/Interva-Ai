# Vercel Deployment

## Vercel project settings

1. Import the repository into Vercel and set **Root Directory** to `frontend`.
2. Use the Next.js framework preset and Node.js 20.x.
3. Keep `NEXT_PUBLIC_API_URL` set to your existing FastAPI origin `https://nextapi.vpnpro.in/` in each Vercel environment. The frontend reads this value and normalizes its trailing slash; production browser requests use the same-origin `/backend-api` proxy. Do not point it to the frontend domain or its aliases.
4. Set `NEXT_PUBLIC_SITE_URL=https://intervai.vpnpro.in` to the canonical production origin. Optionally set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to enable GA4 only after a visitor accepts analytics cookies.
5. Deploy. `vercel.json` uses `npm ci` and `npm run build`. The build packages `public/buddy-extension.zip` using the same configured backend origin.

Gemini credentials and other server secrets belong on the backend only.

## Backend and Firebase

- Set the backend's `FRONTEND_ORIGIN` to the deployed frontend origin `https://intervai.vpnpro.in`. The current FastAPI CORS configuration permits this one configured origin plus localhost; Vercel preview domains will not be able to call the API unless the backend CORS policy is extended to allow them.
- In Firebase Authentication, enable the Google provider and add `intervai.vpnpro.in` under **Authorized domains**. Add a Vercel preview hostname only if preview deployments need Firebase authentication.
- Set the frontend's `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, and `NEXT_PUBLIC_FIREBASE_APP_ID` in each Vercel environment. They must all belong to the same Firebase project. For production, set `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=intervai.vpnpro.in`; Next.js proxies Firebase's `/__/auth/*` and `/__/firebase/*` helper paths to `interv-ai-880ac.firebaseapp.com` so redirect auth uses the app's first-party domain. Set the Google OAuth client's authorized redirect URI to `https://intervai.vpnpro.in/__/auth/handler`.
- Confirm the deployed API is reachable over HTTPS and its auth, onboarding, and other required routes are available before testing the frontend.
- Configure backend `SMTP_USER` and `SMTP_PASSWORD` so successful sign-ins can queue the HTML account-security notification email. `SMTP_HOST`, `SMTP_PORT`, and `ADMIN_EMAIL` can override the existing mail defaults.

Firebase's public web configuration is read from the `NEXT_PUBLIC_FIREBASE_*` variables in `lib/firebase/config.ts`.

## Local production checks

From `frontend`, run:

```sh
npm ci
npm run lint
npx tsc --noEmit
npm run build
```
