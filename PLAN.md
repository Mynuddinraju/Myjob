# MyJob — Master Plan and Requirements (Canonical)

## Product scope
Photo-first multi-tenant portfolio, following the approved navy/gold HST reference. **Only two public pages**: Completed Works (the homepage) and Our Services. Contact details are at the **end of Our Services**. No separate public login/signup, About, Contact or Blog. Public URL: `/s/{tenant-slug}`, with later support for verified custom domains.

## Gallery and before/after behavior
- Each gallery item has an **After** image (required); a **Before** image is optional.
- Render an accessible draggable Before/After slider **only if a Before image has been uploaded**. Without Before, render an ordinary After photograph, without slider.
- Tenant admin can add, replace or remove the Before image for every job photo.
- One Before/After pair counts as **one** gallery photo towards the tenant's photo quota (but two stored Cloudinary assets).
- Mobile two-column and desktop three/four-column gallery, photo-first layout, optional captions, category and title.

## Image pipeline
Use **Cloudinary, not Supabase Storage**. Images are resized and converted to WebP in the browser before any transfer (long edge ≤1920px, target ~350 KB, server cap 2MB; actual size may vary). Cloudinary stores optimized file, and delivery URL uses f_auto,q_auto:good,c_limit and responsive width. CDN browser caching, loading=lazy; database holds tiny metadata/Cloudinary public IDs, not image binaries.

## Tenant admin at /admin
Supabase Auth sign up/login, email verification and six-digit password-reset email code via Resend verified sender. Create private tenant workspace/slug. Edit job projects, upload/delete photos, optional before images, service text/images and logo/hero/contact details. Tenant authentication and all data operations restricted to matching tenant_id.

## Super Admin at /super-admin
Separate login, credentials configured in Vercel environment: SUPER_ADMIN_EMAIL and a bcrypt SUPER_ADMIN_PASSWORD_HASH, signed secret cookie. Manage tenant status active/trial/blocked, trial expiry, photo limits and custom-domain assignment. PostgreSQL RPC atomically reserves After-photo slots to avoid concurrent quota bypass. Trial/blocked sites are withheld when not active/valid.

## Tech and setup
Next.js App Router + CSS, Vercel, Supabase Postgres/Auth (service role ONLY server-side; RLS on every exposed table), Cloudinary, Resend for OTP email. Configure environment variables using .env.example; run supabase/schema.sql. Connect repo to Vercel; supply actual API credentials only in secure Vercel settings. The login email does not by itself authorize email sending; MAIL_FROM must use a verified sending domain.

## Security / launch checklist
- [x] Responsive two-page gallery and services UI
- [x] Optional Before/After slider
- [x] Browser WebP compression, Cloudinary server upload
- [x] Tenant Auth and separate Super Admin
- [x] SQL and atomic photo quota
- [ ] Set real credentials and apply SQL in Supabase
- [ ] End-to-end production build, mobile and login testing
- [ ] Verify email provider + OTP delivery
- [ ] Add distributed email/IP rate limits, audit logging, anti-CSRF for super admin
- [ ] Verify DNS ownership and connect custom domains with Vercel
- [ ] Cloudinary quota monitoring and maintenance

**Always preserve these requirements when making later changes. Do not expand scope unless requested.**