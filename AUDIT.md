# Pre-launch checklist audit

Initial audit of the existing Next.js 15 App Router frontend and FastAPI backend. Production site URL found in the repository: `https://intervai.vpnpro.in`. No implementation changes were made before recording this initial pass.

| # | Item | Status | Evidence | Plan |
|---:|---|---|---|---|
| 1 | Custom 404 page | Present | `frontend/app/not-found.tsx` | Keep; verify it renders as a Next.js 404. |
| 2 | Favicons and web manifest | Partial | `frontend/public/favicon.ico`, `frontend/app/icon.svg` | Add required PNG sizes, Apple icon, and manifest references. |
| 3 | Loading skeletons and empty states | Partial | `frontend/app/loading.tsx`, `frontend/components/ui/States.tsx`, route-specific loading/empty states | Audit async screens; fill only material gaps. |
| 4 | Toast notifications | Partial | `frontend/components/providers/ToastProvider.tsx`, `frontend/components/marketing/ContactForm.tsx` | Keep global provider and wire user-facing async outcomes where missing. |
| 5 | Reduced-motion support | Present | `frontend/app/globals.css` | Keep and verify animation rules; no autoplay animation found that bypasses them. |
| 6 | Social-sharing images | Present | `frontend/app/opengraph-image.tsx`, `frontend/app/layout.tsx` | Keep generated default image and verify metadata references. |
| 7 | Event tracking | Partial | `frontend/components/privacy/CookieConsent.tsx`, `frontend/components/marketing/ContactForm.tsx` | Add a reusable consent-gated tracker and CTA, signup, form-submit, and outbound-link events. |
| 8 | Cookie consent | Partial | `frontend/components/privacy/CookieConsent.tsx`, `frontend/app/cookies/page.tsx` | Add customization and a Privacy Policy link; preserve opt-in gating. |
| 9 | Security headers | Partial | `frontend/next.config.js` | Add a report-only CSP while retaining active security headers. |
| 10 | Contact form email notification | Partial | `frontend/components/marketing/ContactForm.tsx`, `backend/app/api/contact.py`, `backend/app/core/email_service.py`, `backend/app/core/config.py` | Add contact recipient configuration to the environment template and verify form/server validation and delivery wiring. |
| 11 | Unique title and description per page | Partial | `frontend/app/layout.tsx`; metadata in 14 public pages | Add route-specific metadata and noindex policy for application/private pages. |
| 12 | Open Graph and Twitter metadata | Present | `frontend/app/layout.tsx`, public-page metadata, `frontend/app/opengraph-image.tsx` | Keep and verify rendered page tags. |
| 13 | XML sitemap | Partial | `frontend/app/sitemap.ts` | Include all indexable public routes and `lastModified`. |
| 14 | robots.txt | Partial | `frontend/app/robots.ts` | Disallow private application/API paths and point to the sitemap. |
| 15 | Canonical URLs | Partial | `frontend/app/layout.tsx`, public-page metadata | Add canonical metadata for indexable routes; prevent indexing of private routes. |
| 16 | schema.org JSON-LD | Partial | `frontend/app/layout.tsx`, `frontend/components/marketing/TopNav.tsx` | Keep Organization/WebSite/BreadcrumbList and add relevant homepage, FAQ, and contact types. |
| 17 | Breadcrumb navigation | Present | `frontend/components/marketing/TopNav.tsx` | Keep visible accessible breadcrumbs and their BreadcrumbList data. |
| 18 | Internal links | Partial | `frontend/components/marketing/Footer.tsx`, marketing pages | Verify public pages are discoverable and link relevant related pages where absent. |
| 19 | WebP/AVIF support and image dimensions | Present | `frontend/next.config.js`; Next.js `Image` components in `frontend/components/marketing/` and `frontend/components/jobs/` | Keep; verify output and dimensions. |
| 20 | Lazy loading and LCP image priority | Partial | Next.js `Image` components; `frontend/components/marketing/Hero.tsx`; `frontend/components/jobs/JobCard.tsx` | Verify generated image attributes; explicitly mark below-fold images async/lazy and hero high priority if supported. |
| 21 | Font loading | Present | `frontend/app/layout.tsx` | Keep `next/font`, Latin subset, preload behavior, and `display: swap`. |

## Initial findings and constraints

- The frontend is Next.js 15 with the App Router, React, TypeScript, and Tailwind; its deployment configuration includes Vercel proxy behavior in `frontend/next.config.js`.
- The backend is FastAPI with SQLAlchemy/Alembic and SMTP email support.
- Existing local environment files are not audit evidence for production secrets. Do not copy secret values into this report or Git.
- Production SMTP recipient/delivery, analytics property configuration, and actual domain hosting behavior require deployment-side verification.

## Final status

Pending implementation and verification.
