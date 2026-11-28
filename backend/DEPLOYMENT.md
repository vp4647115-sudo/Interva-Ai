# Railway backend deployment

## Create the API service

1. Create a Railway project from this GitHub repository and add a service from the repo.
2. Set the service's **Root Directory** to `/backend`. Railway will build the included `Dockerfile` and load `railway.json`, which configures the `/health` deployment check.
3. Use a persistent PostgreSQL database. You can add a Railway Postgres service and set `DATABASE_URL` to `${{Postgres.DATABASE_URL}}`, or use the PostgreSQL connection URI from Supabase's **Connect** panel. A Supabase project/API URL such as `https://<project-ref>.supabase.co` is not a database URL; set that as `SUPABASE_URL` only. Never set `DATABASE_URL` to that HTTPS URL.
4. Configure the API's environment variables:
   - `ENVIRONMENT=production`
   - `DATABASE_URL` with the PostgreSQL connection URI, stored as a Railway secret
   - `FRONTEND_ORIGIN=https://intervai.vpnpro.in`
   - `FIREBASE_PROJECT_ID=interv-ai-880ac`
   - `FIREBASE_SERVICE_ACCOUNT_JSON` with the Firebase service-account JSON stored as a Railway secret
   - `GEMINI_API_KEY` if AI endpoints should be enabled
   - `SMTP_USER` and `SMTP_PASSWORD` if login notifications and other email should be sent
   - `CONTACT_EMAIL` for website contact-form notifications (defaults to `ADMIN_EMAIL`, then `SMTP_USER`)
   - Contact-form mail is queued with FastAPI background tasks; validate recipient delivery from the deployment logs and mailbox.
   - `APP_URL=https://intervai.vpnpro.in`
5. Deploy the service and generate or attach a public HTTPS domain. Open `https://<backend-domain>/health`; it must return `{"status":"ok"}`.

The container runs `alembic upgrade head` before starting Uvicorn. A deployed
backend now refuses to start with SQLite or a non-PostgreSQL `DATABASE_URL`,
so a bad database setting fails visibly at deployment instead of producing
authenticated API 500 errors at runtime.

The onboarding-state endpoint expects the `onboarding_state` table created by
the initial Alembic migration. After deployment, verify the production
database is at the current Alembic head with `alembic current`. If the API is
deployed through the Python function in `vercel.json` instead of this Docker
service, that function does not run migrations automatically; run
`alembic upgrade head` from the backend root with the production
`DATABASE_URL` before sending traffic. Do not create tables from request
handlers or run schema migrations independently in every serverless instance.

Keep all service-account keys, API keys, passwords, and database credentials in Railway's secret variables. Never put them in the frontend or commit them to Git.

## Connect Vercel

The frontend reads `NEXT_PUBLIC_API_URL` from the Vercel environment and proxies `/backend-api/:path*` to that origin. Keep it set to `https://nextapi.vpnpro.in/`; the frontend normalizes the trailing slash. Do not use `https://api.intervai.vpnpro.in`, which aliases to the frontend and produces 404s. Deploy the frontend after merging the API proxy fix.

Set the frontend `NEXT_PUBLIC_SITE_URL` to the canonical production origin and `NEXT_PUBLIC_API_URL` to the backend API origin. Optional Google Analytics page-view and event tracking is enabled only after a visitor accepts analytics cookies. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in the Vercel frontend environment to enable it; without that value, consent is still saved but no third-party analytics script is loaded. The public contact form requires the backend SMTP settings above and a verified recipient address. The matching public variables are documented in `frontend/.env.example`.

After deployment, the browser should call the frontend's `/backend-api/api/...` path and Vercel should forward it to the FastAPI `/api/...` route. A `401` on an auth route without a Firebase token means the API route is reachable; a `404` usually means the frontend proxy target is wrong or the frontend has not been redeployed with the fix.
