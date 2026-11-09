# Railway backend deployment

## Create the API service

1. Create a Railway project from this GitHub repository and add a service from the repo.
2. Set the service's **Root Directory** to `/backend`. Railway will build the included `Dockerfile` and load `railway.json`, which configures the `/health` deployment check.
3. Add a Railway Postgres service. In the API service, set `DATABASE_URL` to the Postgres service's `DATABASE_URL` reference, for example `${{Postgres.DATABASE_URL}}`. The backend converts Railway's `postgres://` or `postgresql://` URL to the async `asyncpg` driver. Do not use the default SQLite URL for a persistent production deployment.
4. Configure the API's environment variables:
   - `ENVIRONMENT=production`
   - `FRONTEND_ORIGIN=https://intervai.vpnpro.in`
   - `FIREBASE_PROJECT_ID=interv-ai-880ac`
   - `FIREBASE_SERVICE_ACCOUNT_JSON` with the Firebase service-account JSON stored as a Railway secret
   - `GEMINI_API_KEY` if AI endpoints should be enabled
   - `SMTP_USER` and `SMTP_PASSWORD` if login notifications and other email should be sent
   - `APP_URL=https://intervai.vpnpro.in`
5. Deploy the service and generate or attach a public HTTPS domain. Open `https://<backend-domain>/health`; it must return `{"status":"ok"}`.

Keep all service-account keys, API keys, passwords, and database credentials in Railway's secret variables. Never put them in the frontend or commit them to Git.

## Connect Vercel

In the Vercel frontend project, set `NEXT_PUBLIC_API_URL` to the backend's public origin only, such as `https://<backend-domain>` -- not the frontend URL, not a path ending in `/api`, and no trailing slash. Set it for the Production environment (and Preview if previews should use the API), then redeploy so Next.js creates its `/backend-api/:path*` rewrite using the new value.

After redeploy, the browser should call the frontend's `/backend-api/api/...` path and Vercel should forward it to the Railway backend's `/api/...` route. A `401` on an auth route without a Firebase token means the API route is reachable; a `404` usually means the rewrite target or backend deployment is still wrong.
