# Pre-launch checklist audit

Final audit of the existing Next.js 15 App Router frontend and FastAPI backend. Implementation was limited to missing or partial checklist items; the existing design and working product flows were preserved.

Production origin: `https://intervai.vpnpro.in`

| # | Item | Status | Evidence | Final notes |
|---:|---|---|---|---|
| 1 | Custom 404 page | Present | `frontend/app/not-found.tsx` | Branded not-found page; a production-mode local request to an unknown route returned HTTP 404. |
| 2 | Favicons and web manifest | Present | `frontend/app/layout.tsx`, `frontend/app/manifest.ts`, `frontend/public/favicon.ico`, `frontend/public/favicon-16x16.png`, `frontend/public/favicon-32x32.png`, `frontend/public/apple-touch-icon.png`, `frontend/public/favicon-192x192.png`, `frontend/public/favicon-512x512.png` | Required icon sizes and the manifest are linked and served successfully. PNG dimensions and ICO header were checked. |
| 3 | Loading skeletons and empty states | Present | `frontend/app/loading.tsx`, `frontend/components/ui/States.tsx`, `frontend/components/jobs/JobStates.tsx`, `frontend/app/answer-library/page.tsx`, `frontend/app/saved-jobs/page.tsx` | Shared and route-level skeletons cover loading states; list views provide friendly empty states and next steps. |
| 4 | Toast notifications | Present | `frontend/components/providers/ToastProvider.tsx`, `frontend/components/marketing/ContactForm.tsx`, `frontend/app/profile/page.tsx` | One global toast provider is used for contact submission and profile async outcomes. |
| 5 | Reduced-motion support | Present | `frontend/app/globals.css` | Existing `prefers-reduced-motion` rules reduce motion across the application. |
| 6 | Social-sharing images | Present | `frontend/app/opengraph-image.tsx`, `frontend/lib/seo.ts`, `frontend/app/layout.tsx` | Generated 1200×630 branded default image is referenced through absolute Open Graph and Twitter metadata. |
| 7 | Event tracking | Partial | `frontend/lib/analytics.ts`, `frontend/components/privacy/CookieConsent.tsx`, `frontend/lib/firebase/auth.ts` | Consent-gated tracking covers page views, CTA clicks, form submissions, outbound links, and signup methods. Configure a GA4 measurement ID and verify production events to activate delivery. |
| 8 | Cookie consent | Present | `frontend/components/privacy/CookieConsent.tsx`, `frontend/app/cookies/page.tsx`, `frontend/app/privacy/page.tsx` | Accept, reject, customize, persisted preferences, later preference management, privacy-policy link, and analytics gating are implemented. |
| 9 | Security headers | Present | `frontend/next.config.js` | CSP is report-only; frame, content-type, referrer, permissions, and production HSTS headers are configured. Local production-mode headers were verified. |
| 10 | Contact form email notification | Partial | `frontend/components/marketing/ContactForm.tsx`, `backend/app/api/contact.py`, `backend/app/core/email_service.py`, `backend/app/core/config.py`, `backend/.env.example` | Client/server validation, honeypot, API route, SMTP delivery path, and focused tests are present. Configure production SMTP and recipient settings and verify real delivery. |
| 11 | Unique title and description per page | Present | `frontend/lib/seo.ts`, `frontend/app/**/layout.tsx`, public route metadata | Reusable metadata helper supplies page-specific title and description. Built HTML was scanned for title and description coverage and length limits. |
| 12 | Open Graph and Twitter metadata | Present | `frontend/lib/seo.ts`, `frontend/app/layout.tsx`, public route metadata | Open Graph title, description, image, URL, type/site name and large-image Twitter card metadata are generated per route. |
| 13 | XML sitemap | Present | `frontend/app/sitemap.ts` | Sitemap includes the public routes with absolute canonical URLs and `lastModified`; local production endpoint returned HTTP 200. |
| 14 | robots.txt | Present | `frontend/app/robots.ts` | Allows public crawling, excludes private/application/API paths, and points to the sitemap. |
| 15 | Canonical tags | Present | `frontend/lib/seo.ts`, `frontend/app/**/layout.tsx` | Self-referencing absolute canonical URLs use the configured origin; private app routes are marked noindex. |
| 16 | schema.org structured data | Present | `frontend/components/seo/JsonLd.tsx`, `frontend/app/page.tsx`, `frontend/app/faq/page.tsx`, `frontend/app/contact/page.tsx` | Organization, WebSite, SoftwareApplication, FAQPage, and ContactPage JSON-LD are included where relevant. |
| 17 | Breadcrumb navigation | Present | `frontend/components/seo/AppBreadcrumbs.tsx`, `frontend/components/marketing/TopNav.tsx` | Visible accessible breadcrumbs and BreadcrumbList structured data are included on inner pages. |
| 18 | Internal links | Present | `frontend/components/marketing/Footer.tsx`, public route pages, `frontend/components/seo/AppBreadcrumbs.tsx` | Public pages are discoverable from navigation/footer and contextual or breadcrumb links. |
| 19 | WebP/AVIF support and image dimensions | Present | `frontend/next.config.js`, `frontend/components/marketing/`, `frontend/components/jobs/` | Next.js image optimization enables AVIF/WebP and uses dimension-aware image components to limit layout shift. |
| 20 | Lazy loading and LCP image priority | Present | `frontend/components/marketing/Hero.tsx`, `frontend/components/marketing/`, `frontend/components/jobs/` | Below-fold images use lazy loading/async decoding; the hero image receives high fetch priority. |
| 21 | Faster font loading | Present | `frontend/app/layout.tsx` | `next/font` bundles the Latin subset, preloads the critical font, and uses `display: swap`. |

## Verification

- `npm run lint` — passed without warnings or errors (Next.js notes that `next lint` is deprecated for Next.js 16).
- `npx tsc --noEmit` — passed.
- `npm run build` — passed; generated 43 routes, including the manifest, sitemap, robots, and Open Graph image.
- Focused backend contact and notification tests — 8 passed.
- Local production smoke checks — public pages, manifest, sitemap, robots, all required icon assets, and security headers returned successfully; unknown route returned 404.
- Contact, FAQ, and dashboard HTML — titles, descriptions, canonicals, Open Graph title, and Twitter card tags were present.
- Before consent, the analytics script was absent. Production analytics delivery requires a configured measurement ID and was not verified against a live property.
- Production SMTP delivery, hosting-provider configuration, and live CSP reports cannot be verified from local checks.

## Manual production steps

1. Set `NEXT_PUBLIC_SITE_URL=https://intervai.vpnpro.in` in each frontend deployment environment. Keep `NEXT_PUBLIC_API_URL` pointed at the existing backend origin.
2. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` only if GA4 tracking is desired, then verify events in the live property after accepting analytics consent.
3. Configure `CONTACT_EMAIL` (or the documented `ADMIN_EMAIL` fallback) and the existing SMTP host, port, user, and password in the backend deployment environment. Submit a real contact request and confirm delivery without exposing credentials.
4. Review production CSP report-only behavior and hosting headers before considering an enforced CSP or changes to HSTS.
5. Confirm the production domain, mail provider, privacy disclosures, and analytics configuration with the relevant account owners.

No checklist items are missing. Analytics activation and real email delivery remain partial until their deployment-specific configuration is verified.
