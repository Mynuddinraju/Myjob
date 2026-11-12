# MyJob — Master Requirements & Implementation Plan

> **Canonical scope reference.** Read this file before each future update. Do not expand scope without user approval.

## Goal
A lightweight, premium, mobile-first **multi-tenant completed-work photo gallery** inspired by the provided navy/gold HST reference. Public viewers have **no login/signup**. Exactly two public sections/pages: **Completed Works (home)** and **Our Services**. **Contact details only at the bottom of Our Services**. No separate About, Contact, or Blog.

## Required before/after behavior (high priority)
- Every gallery photo has one **After** image (required) and **Before** image (optional).
- If Before is present, the viewer shows a keyboard/touch/mouse-controlled draggable Before/After split slider. If absent, **no comparison control or placeholder** is rendered, only the After photo.
- Admin can upload, replace or remove Before independently, on any photo. A pair counts as **one gallery entry** toward tenant quota; it may store two Cloudinary assets.
- Browser compresses both before AND after *prior to upload*. Never upload raw originals. Good quality WebP with up to 1920px longest side, target ~350KB (not a hard guarantee; final server limit 2MB). Cloudinary delivery uses `f_auto,q_auto:good,w_<size>,c_limit`. Browser caching via Cloudinary CDN.

## Public UX
- Header: tenant logo/name | Completed Works | Our Services. No other menu items.
- Completed Works is the landing view: navy/gold hero (admin-editable banner URL), photo-first responsive grid (2 mobile columns, 3-4 desktop). Optional photo caption/title. Support touch and keyboard slider.
- Services page: admin-editable cards, photos, description. At the very end: editable company name, phone, WhatsApp, email, office address.
- Tenant URLs: `/s/{tenant-slug}` and `/s/{tenant-slug}/services`. Later map verified custom domains to one tenant without duplicating deployments. Root domain is strictly visitor-only: show the configured DEFAULT_TENANT_SLUG company portfolio, or automatically the sole active tenant, or branded public fallback before tenant setup. Never show admin/login/sign-up on / or /services.
- Maintain reference visual direction; sample HST images are **not authentic job photographs**.

## Tenant admin `/admin`
- Email signup and login (Supabase Auth), email verification, forgot password with a 6-digit code by verified sender.
- Account creates a unique tenant slug, free trial initially. Photos: create job, upload multiple After images, optional Before images per photo, delete and edit. Services: add/edit/delete. Contact/brand: edit business name, headline, logo, hero image URL, phone, WhatsApp, email/address.
- On mobile, admin can choose camera/gallery pictures and upload easily. Browser optimized WebP before Cloudinary transfer.
- One tenant account must never access another tenant's data. Server APIs verify JWT via Supabase getUser and scope all access by tenant_id. Browser never sees Supabase service role or Cloudinary secret.

## Super Admin `/super-admin`
- Separate private URL. Login email + bcrypt password hash from Vercel environment variables. Signed secure HTTP-only cookie and login attempt throttling.
- Tenant list; update active/trial/blocked, trial expiration, quota (# After/photo entries), custom domain mapping.
- Quota enforced **atomically in PostgreSQL** before uploading to Cloudinary. Super Admin may raise/lower anytime.
- Status blocked/expired prevents public display and tenant mutation; do not delete stored photos.

## Technology and efficiency
- Next.js App Router + CSS, deployed on Vercel; Supabase Postgres and Auth; Cloudinary images. Images **not** stored in Postgres, only small URLs, public IDs, caption and state. No Supabase Storage required.
- All uploads optimized in browser via canvas/WebP, EXIF effectively removed, max dimensions; reject oversized/non-WebP on server. Cloudinary CDN uses negotiated modern format/quality for compatible browsers.
- Lazy-load below-fold images. Uploads capped; prevent excessive bandwidth and storage using quotas, Cloudinary account monitoring, rate limits, max payload. Cloudinary/free quotas depend on provider plan and may change.
- Security: service role server only, RLS on exposed tables, no open data policies; strict server ownership checks; DNS/domain ownership validation **must be added before self-service custom domains are enabled**. Custom domains in super-admin are manually entered by trusted owner only.

## Setup and deployment steps
1. Create Supabase project; run `supabase/schema.sql` once via SQL Editor. Enable Email Auth; configure SMTP or verified sender for auth confirmation.
2. Create Cloudinary account (unsigned browser uploads should NOT be enabled); configure server Cloudinary key/secret.
3. Create Resend account and verify sender domain (`MAIL_FROM`) for custom 6-digit reset-code emails. `SUPER_ADMIN_EMAIL` specifies **super admin login**, not an outgoing email service. Never assume it can send email without SMTP/Resend.
4. Set `.env.example` variables in Vercel Project Settings; never commit actual secrets. Generate bcrypt password hash and 32+ character session secret.
5. Connect GitHub repo to Vercel, set Next.js framework, deploy and verify both tenant and super-admin logins.
6. Test concurrent photo limit enforcement, before/after, custom domain route, blocked tenants, OTP expiry, mobile galleries, deletion and image compression.

## Caveats / pending hardening
- Before any public paid launch: add durable per-IP and per-email OTP rate limiting, pagination for large user counts, Cloudinary usage monitoring, detailed audit log, validated custom-domain ownership & Vercel domain configuration, anti-CSRF for cookie-authenticated super-admin mutations, automated tests and backup policy.
- This is an initial functional codebase, not a verified production-ready SaaS launch. Do not claim otherwise.

## Acceptance checklist
- [x] Two public pages, photo-first responsive layout.
- [x] Optional Before/After slider only if before exists.
- [x] Browser WebP optimization & Cloudinary server upload.
- [x] Separate tenant admin, signup, basic reset-code flow.
- [x] Separate Super Admin status/trial/photo quota panel.
- [x] SQL schema and atomic quota reserve function.
- [ ] Real database configured, SQL deployed, end-to-end live test.
- [ ] Verified sender configured, real OTP delivery test.
- [ ] GitHub/Vercel production deployment tested.
- [ ] Custom domain DNS ownership verification and Vercel association.

## Build/security and progressive gallery — 2026-11-12 update
- Next.js 15.3.3 triggered Vercel's vulnerable-framework build rejection. Updated to patched **Next.js 15.5.29** and React 19.2.7. Do not downgrade.
- Public gallery uses browser IntersectionObserver with 320px preload margin; image elements only mount near viewport. Skeleton shimmer and scroll-triggered staggered fade/translate animation. Reduced-motion preference respected.
- Browser decoding async and native lazy loading; Cloudinary serves responsive automatically optimized images. Optional Before/After photo remains conditional.
- If Vercel still reports `No Output Directory named public`, clear `Output Directory` override in **Vercel Settings → Build and Deployment**, set Framework Preset Next.js. This setting cannot be fixed through app source code alone.
- Production environment values, email, Cloudinary upload, tenant controls and full live site tests must be verified prior to declaring launch ready.


## Visitor homepage routing — 2026-11-12
- `/` and `/services` are always **public visitor pages** without login/signup buttons or links. No separate public Home/Blog/About/Contact pages.
- Private tenant login/signup is ONLY `/admin`; Super Admin login ONLY `/super-admin`.
- Homepage tenant lookup: first an active custom-domain mapping; next `DEFAULT_TENANT_SLUG` (configured in Vercel); if not set, auto-use the sole active tenant. Never arbitrarily select among several tenants.
- When no tenant exists, show a polished HST-branded public fallback with services and contact, but no fabricated completed-work images. Admin must create a tenant and upload authentic projects.
- One SaaS deployment serves tenants at `/s/[slug]`; customer domain wiring remains future work.
- Vercel project API continues to report not found despite screenshot evidence of its existence; GitHub push will trigger redeploy if existing integration is connected.
