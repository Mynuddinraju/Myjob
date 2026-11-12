# MyJob — Master Project Plan

## Scope
A responsive, navy-and-gold, photo-first **multi-tenant portfolio** based on the approved HST design. Exactly two public pages: **Completed Works** (home) and **Our Services**. Contact information appears at the bottom of Services. **No viewer login/signup**. Private tenant admin at /admin and separate super admin at /super-admin.

## Photo gallery
- Every gallery photo requires an After image and may optionally have a Before image.
- Render touch/mouse/keyboard draggable Before/After slider **only when Before is uploaded**; otherwise show a single normal photograph with no slider.
- Tenant admin can upload, replace, remove Before independently; gallery item with a Before and After counts as one photo toward quota.
- Browser converts image to optimized WebP **before upload** (target ~350 KB; max 1920px longest side and 2MB server limit, actual sizes vary). Store files in Cloudinary, **not Supabase Storage**. Use Cloudinary CDN responsive transforms f_auto,q_auto:good, browser caching, lazy loading. Postgres stores only IDs and metadata.

## Tenant admin
- Email signup and Supabase Auth login; email confirmation; forgot-password six-digit code using a verified sender.
- Create unique tenant slug and own site at /s/{slug}; later allow a verified custom domain.
- Project/gallery uploads, descriptions optional; services title/image/description; editable company branding and contact info.
- Strict tenant isolation via server JWT verification and tenant_id checks. No service role secrets exposed in browser.

## Super admin
- Login email and bcrypt password hash stored in Vercel env, signed HTTP-only session cookie.
- List tenants; status trial / active / blocked; trial expiry; per-tenant photo upload quota; custom domain association.
- Quotas enforced atomically in database before uploads. Blocking hides public website and prevents modifications.

## Stack and setup
Next.js App Router on Vercel, Supabase PostgreSQL + Auth, Cloudinary. Resend (or configured SMTP provider) for reset codes; SUPER_ADMIN_EMAIL is login identity, not an email-sending mechanism. Setup: run supabase/schema.sql, configure .env.example keys privately in Vercel, connect GitHub to Vercel and verify end-to-end.

## Remaining production hardening
Verify real Supabase+Cloudinary connectivity, OTP rate-limiting and delivery, custom-domain DNS ownership and Vercel domain mapping, anti-CSRF protections, monitoring and end-to-end deployment. Never claim full production readiness before testing.

**Before future changes, read and preserve this plan.**