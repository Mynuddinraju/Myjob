# MyJob — Multi-tenant Completed Works Portfolio

Built using Next.js, Supabase Postgres/Auth, and Cloudinary.

Read [PLAN.md](PLAN.md) for **all requirements, configuration and restrictions**. Required environment variables: [.env.example](.env.example). Schema: [supabase/schema.sql](supabase/schema.sql).

Public root: `/` (Completed Works) and `/services`; tenant-specific sites: `/s/{slug}` and `/s/{slug}/services`. Tenant admin (private): `/admin`; super admin (private): `/super-admin`. Root never shows login/sign-up. Set optional `DEFAULT_TENANT_SLUG` in Vercel to select the public homepage company (otherwise the sole active tenant is used).

Local development: `npm install && npm run dev` (add `.env.local` first). Deployment: import this repository to Vercel, configure secrets, run schema on Supabase.

**Important:** This is an initial implementation that requires real environment integration and security testing before production. Never commit `.env.local` or Supabase service-role / Cloudinary secret keys.
