# MyJob — Multi-tenant Completed Works Portfolio

Built using Next.js, Supabase Postgres/Auth, and Cloudinary.

Read [PLAN.md](PLAN.md) for **all requirements, configuration and restrictions**. Required environment variables: [.env.example](.env.example). Schema: [supabase/schema.sql](supabase/schema.sql).

Public: `/s/{slug}` and `/s/{slug}/services`; tenant admin: `/admin`; super admin: `/super-admin`.

Local development: `npm install && npm run dev` (add `.env.local` first). Deployment: import this repository to Vercel, configure secrets, run schema on Supabase.

**Important:** This is an initial implementation that requires real environment integration and security testing before production. Never commit `.env.local` or Supabase service-role / Cloudinary secret keys.
