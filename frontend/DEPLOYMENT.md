# Vercel Deployment

## Vercel project settings

1. Import the repository into Vercel and set **Root Directory** to `frontend`.
2. Use the Next.js framework preset and Node.js 20.x.
3. Set `NEXT_PUBLIC_API_URL` to the deployed FastAPI origin, for example `https://api.example.com`. Use HTTPS and do not include a trailing slash. Set it for every Vercel environment that should build. Vercel builds fail when this variable is missing.
4. Deploy. `vercel.json` uses `npm ci` and `npm run build`. The build automatically packages `public/buddy-extension.zip` with the configured API origin.

`NEXT_PUBLIC_API_URL` is a public browser variable, not a place for secrets. Gemini credentials and other server secrets belong on the backend only.

## Backend and Firebase

- Set the backend's `FRONTEND_ORIGIN` to the deployed frontend origin, such as `https://www.example.com`. The current FastAPI CORS configuration permits this one configured origin plus localhost; Vercel preview domains will not be able to call the API unless the backend CORS policy is extended to allow them.
- Add the production frontend hostname to Firebase Authentication's **Authorized domains**. Add a Vercel preview hostname only if preview deployments need Firebase authentication.
- Confirm the deployed API is reachable over HTTPS and its auth, onboarding, and other required routes are available before testing the frontend.

Firebase's public web configuration is currently defined in `lib/firebase/config.ts`; no Firebase client environment variables are required by the frontend at build time.

## Local production checks

From `frontend`, run:

```sh
npm ci
npm run lint
npx tsc --noEmit
NEXT_PUBLIC_API_URL=https://api.example.com npm run build
```
