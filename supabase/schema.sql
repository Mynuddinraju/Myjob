-- Run once in Supabase SQL editor. Service-role key used only from Next.js server.
create extension if not exists pgcrypto;
create table if not exists public.tenants (
 id uuid primary key default gen_random_uuid(),slug text unique not null check(slug ~ '^[a-z0-9-]{3,40}$'),name text not null,
 status text not null default 'trial' check(status in ('trial','active','blocked')),
 trial_ends_at timestamptz,photo_limit integer not null default 30 check(photo_limit>=0),
 custom_domain text unique,tagline text,logo_url text,hero_url text,phone text,email text,address text,whatsapp text,
 created_at timestamptz not null default now());
create table if not exists public.tenant_users (
 user_id uuid primary key references auth.users(id) on delete cascade,
 tenant_id uuid not null references public.tenants(id) on delete cascade,
 role text not null default 'owner' check(role in ('owner','admin')));
create table if not exists public.projects (
 id uuid primary key default gen_random_uuid(),tenant_id uuid not null references public.tenants(id) on delete cascade,
 title text not null,description text default '',category text default 'Completed Work',featured boolean default false,
 sort_order integer default 0,created_at timestamptz default now(),unique(id,tenant_id));
create table if not exists public.photos (
 id uuid primary key default gen_random_uuid(),tenant_id uuid not null references public.tenants(id) on delete cascade,
 project_id uuid not null,caption text default '',sort_order integer default 0,
 status text not null default 'pending' check(status in ('pending','ready')),
 cloud_public_id text,image_url text,before_public_id text,before_url text,
 created_at timestamptz default now(),foreign key(project_id,tenant_id) references public.projects(id,tenant_id) on delete cascade);
create index if not exists photos_tenant on public.photos(tenant_id,status);
create index if not exists projects_tenant on public.projects(tenant_id,sort_order);
create table if not exists public.services (
 id uuid primary key default gen_random_uuid(),tenant_id uuid not null references public.tenants(id) on delete cascade,
 title text not null,description text default '',image_url text,sort_order integer default 0,created_at timestamptz default now());
create index if not exists services_tenant on public.services(tenant_id,sort_order);
create table if not exists public.password_reset_codes (
 user_id uuid primary key references auth.users(id) on delete cascade,hash text not null,attempts integer not null default 0,
 created_at timestamptz not null default now(),expires_at timestamptz not null);
create table if not exists public.super_login_attempts (
 ip text primary key,failures integer not null default 0,last_attempt timestamptz not null default now());
-- Deny browser Data API access. Server gets authenticated user via Supabase Auth then performs scoped operations with service role.
alter table public.tenants enable row level security;
alter table public.tenant_users enable row level security;
alter table public.projects enable row level security;
alter table public.photos enable row level security;
alter table public.services enable row level security;
alter table public.password_reset_codes enable row level security;
alter table public.super_login_attempts enable row level security;
revoke all on public.tenants,public.tenant_users,public.projects,public.photos,public.services,public.password_reset_codes,public.super_login_attempts from anon,authenticated;
-- Atomic quota allocation serializes simultaneous uploads for a tenant to prevent exceeding limit.
create or replace function public.reserve_photo_slot(p_tenant uuid,p_project uuid,p_caption text)
returns uuid language plpgsql security definer set search_path='' as $$
declare t public.tenants%rowtype; n integer; rid uuid;
begin
 select * into t from public.tenants where id=p_tenant for update;
 if not found or t.status='blocked' or (t.trial_ends_at is not null and t.trial_ends_at<now()) then raise exception 'Workspace is inactive';end if;
 if not exists (select 1 from public.projects where id=p_project and tenant_id=p_tenant) then raise exception 'Invalid project';end if;
 select count(*) into n from public.photos where tenant_id=p_tenant;
 if n>=t.photo_limit then raise exception 'Photo limit reached';end if;
 insert into public.photos(tenant_id,project_id,caption) values(p_tenant,p_project,left(p_caption,200)) returning id into rid;
 return rid;
end;$$;
revoke all on function public.reserve_photo_slot(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.reserve_photo_slot(uuid,uuid,text) to service_role;
