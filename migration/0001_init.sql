-- TeknoKerja — Consolidated init migration for a fresh Supabase project.
-- Paste this whole file into Supabase SQL Editor and run once.
-- Order: extensions → schemas → enums → helper fns → tables → grants → RLS → policies → triggers → storage buckets → storage policies → auth trigger.

-- ============================================================
-- 1. EXTENSIONS & SCHEMAS
-- ============================================================
create extension if not exists "pgcrypto";
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ============================================================
-- 2. ENUMS
-- ============================================================
do $$ begin
  create type public.app_role as enum ('super_admin','staff');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.article_status as enum ('draft','published');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.booking_status as enum ('pending','confirmed','active','completed','cancelled');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.laptop_status as enum ('ready','rented','maintenance','out_of_stock');
exception when duplicate_object then null; end $$;

-- ============================================================
-- 3. HELPER FUNCTIONS (must exist before RLS policies)
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- has_role / is_admin live in `private` so PostgREST won't expose them via RPC.
create or replace function private.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function private.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles
    where user_id = _user_id and role in ('super_admin','staff'))
$$;

-- Public duplicates kept for backward-compat with existing client code / policies.
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles
    where user_id = _user_id and role in ('super_admin','staff'))
$$;

-- ============================================================
-- 4. TABLES + GRANTS + RLS + POLICIES
-- ============================================================

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "users view own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "users update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create trigger trg_profiles_upd before update on public.profiles for each row execute function public.set_updated_at();

-- ---------- user_roles ----------
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select, insert, update, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "users see own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "super admin sees all roles" on public.user_roles for select to authenticated using (private.has_role(auth.uid(),'super_admin'));
create policy "super admin writes roles" on public.user_roles for insert to authenticated with check (private.has_role(auth.uid(),'super_admin'));
create policy "super admin updates roles" on public.user_roles for update to authenticated using (private.has_role(auth.uid(),'super_admin')) with check (private.has_role(auth.uid(),'super_admin'));
create policy "super admin deletes roles" on public.user_roles for delete to authenticated using (private.has_role(auth.uid(),'super_admin'));

-- ---------- laptops ----------
create table if not exists public.laptops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text, processor text, ram text, ssd text, vga text, screen_size text,
  price_daily integer, price_weekly integer, price_monthly integer,
  status public.laptop_status not null default 'ready',
  photo_url text,
  gallery jsonb not null default '[]'::jsonb,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.laptops to anon;
grant select, insert, update, delete on public.laptops to authenticated;
grant all on public.laptops to service_role;
alter table public.laptops enable row level security;
create policy "public read laptops" on public.laptops for select using (true);
create policy "admin manage laptops" on public.laptops for all to authenticated using (private.is_admin(auth.uid())) with check (private.is_admin(auth.uid()));
create trigger trg_laptops_upd before update on public.laptops for each row execute function public.set_updated_at();

-- ---------- bookings ----------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  whatsapp text not null,
  email text,
  laptop_id uuid references public.laptops(id) on delete set null,
  laptop_name text,
  quantity integer not null default 1,
  start_date date,
  end_date date,
  notes text,
  status public.booking_status not null default 'pending',
  locale text,
  source_page text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant insert on public.bookings to anon;
grant select, insert, update, delete on public.bookings to authenticated;
grant all on public.bookings to service_role;
alter table public.bookings enable row level security;
create policy "anyone create booking" on public.bookings for insert with check (
  length(trim(customer_name)) between 2 and 120
  and length(trim(whatsapp)) between 6 and 32
  and quantity between 1 and 50
);
create policy "admin read bookings" on public.bookings for select to authenticated using (private.is_admin(auth.uid()));
create policy "admin update bookings" on public.bookings for update to authenticated using (private.is_admin(auth.uid())) with check (private.is_admin(auth.uid()));
create policy "super admin delete bookings" on public.bookings for delete to authenticated using (private.has_role(auth.uid(),'super_admin'));
create trigger trg_bookings_upd before update on public.bookings for each row execute function public.set_updated_at();

-- ---------- testimonials ----------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  company text, location text, laptop_rented text,
  rating smallint not null default 5,
  comment text,
  screenshot_url text,
  testimonial_date date,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.testimonials to anon;
grant select, insert, update, delete on public.testimonials to authenticated;
grant all on public.testimonials to service_role;
alter table public.testimonials enable row level security;
create policy "public read published testi" on public.testimonials for select using (published = true);
create policy "admin read all testi" on public.testimonials for select to authenticated using (private.is_admin(auth.uid()));
create policy "admin manage testi" on public.testimonials for all to authenticated using (private.is_admin(auth.uid())) with check (private.is_admin(auth.uid()));
create trigger trg_testi_upd before update on public.testimonials for each row execute function public.set_updated_at();

-- ---------- article_categories ----------
create table if not exists public.article_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);
grant select on public.article_categories to anon;
grant select, insert, update, delete on public.article_categories to authenticated;
grant all on public.article_categories to service_role;
alter table public.article_categories enable row level security;
create policy "public read cats" on public.article_categories for select using (true);
create policy "admin manage cats" on public.article_categories for all to authenticated using (private.is_admin(auth.uid())) with check (private.is_admin(auth.uid()));

-- ---------- articles ----------
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  meta_title text, meta_description text,
  featured_image text,
  gallery jsonb not null default '[]'::jsonb,
  content text, excerpt text,
  author_id uuid references auth.users(id) on delete set null,
  category_id uuid references public.article_categories(id) on delete set null,
  tags text[] not null default '{}',
  locale text not null default 'en',
  status public.article_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.articles to anon;
grant select, insert, update, delete on public.articles to authenticated;
grant all on public.articles to service_role;
create index if not exists idx_articles_slug on public.articles(slug);
create index if not exists idx_articles_status_pub on public.articles(status, published_at desc);
alter table public.articles enable row level security;
create policy "public read published articles" on public.articles for select using (status = 'published');
create policy "admin read all articles" on public.articles for select to authenticated using (private.is_admin(auth.uid()));
create policy "admin manage articles" on public.articles for all to authenticated using (private.is_admin(auth.uid())) with check (private.is_admin(auth.uid()));
create trigger trg_articles_upd before update on public.articles for each row execute function public.set_updated_at();

-- ---------- instagram_gallery ----------
create table if not exists public.instagram_gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  alt_text text, link_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.instagram_gallery to anon;
grant select, insert, update, delete on public.instagram_gallery to authenticated;
grant all on public.instagram_gallery to service_role;
alter table public.instagram_gallery enable row level security;
create policy "Public can view published" on public.instagram_gallery for select using (is_published = true);
create policy "Admins manage all" on public.instagram_gallery for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create trigger set_instagram_gallery_updated_at before update on public.instagram_gallery for each row execute function public.set_updated_at();

-- ---------- website_settings ----------
create table if not exists public.website_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
grant select on public.website_settings to anon;
grant select, insert, update, delete on public.website_settings to authenticated;
grant all on public.website_settings to service_role;
alter table public.website_settings enable row level security;
create policy "public read settings" on public.website_settings for select using (true);
create policy "super admin manage settings" on public.website_settings for all to authenticated using (private.has_role(auth.uid(),'super_admin')) with check (private.has_role(auth.uid(),'super_admin'));
create trigger trg_settings_upd before update on public.website_settings for each row execute function public.set_updated_at();

-- ---------- whatsapp_leads ----------
create table if not exists public.whatsapp_leads (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  location text, service_category text, locale text, page_path text, user_agent text,
  created_at timestamptz not null default now()
);
grant insert on public.whatsapp_leads to anon;
grant select, insert, update, delete on public.whatsapp_leads to authenticated;
grant all on public.whatsapp_leads to service_role;
create index if not exists idx_leads_created on public.whatsapp_leads(created_at desc);
alter table public.whatsapp_leads enable row level security;
create policy "anyone log lead" on public.whatsapp_leads for insert with check (
  event_type = any (array['whatsapp_click','booking_submitted','contact_submitted','form_submitted'])
  and length(event_type) <= 64
);
create policy "admin read leads" on public.whatsapp_leads for select to authenticated using (private.is_admin(auth.uid()));

-- ---------- activity_logs ----------
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  action text not null,
  entity_type text, entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select, insert on public.activity_logs to authenticated;
grant all on public.activity_logs to service_role;
create index if not exists idx_logs_created on public.activity_logs(created_at desc);
alter table public.activity_logs enable row level security;
create policy "admin read logs" on public.activity_logs for select to authenticated using (private.is_admin(auth.uid()));
create policy "admin insert logs" on public.activity_logs for insert to authenticated with check (
  private.is_admin(auth.uid())
  and user_id = auth.uid()
  and (user_email is null or lower(user_email) = lower(auth.jwt() ->> 'email'))
);

-- ============================================================
-- 5. AUTH TRIGGER — auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 6. STORAGE BUCKETS (private) + object policies
-- ============================================================
insert into storage.buckets (id, name, public) values
  ('laptops','laptops',false),
  ('testimonials','testimonials',false),
  ('articles','articles',false),
  ('instagram','instagram',false)
on conflict (id) do nothing;

-- Public read (files served via signed URLs OR public path — front-end uses signed URLs)
create policy "Public read laptops bucket"      on storage.objects for select using (bucket_id = 'laptops');
create policy "Public read testimonials bucket" on storage.objects for select using (bucket_id = 'testimonials');
create policy "Public read articles bucket"     on storage.objects for select using (bucket_id = 'articles');

-- Admin write on laptops / testimonials / articles
create policy "Admins upload to laptops"      on storage.objects for insert to authenticated with check (bucket_id='laptops'      and private.is_admin(auth.uid()));
create policy "Admins update laptops"         on storage.objects for update to authenticated using       (bucket_id='laptops'      and private.is_admin(auth.uid()));
create policy "Admins delete laptops"         on storage.objects for delete to authenticated using       (bucket_id='laptops'      and private.is_admin(auth.uid()));
create policy "Admins upload to testimonials" on storage.objects for insert to authenticated with check (bucket_id='testimonials' and private.is_admin(auth.uid()));
create policy "Admins update testimonials"    on storage.objects for update to authenticated using       (bucket_id='testimonials' and private.is_admin(auth.uid()));
create policy "Admins delete testimonials"    on storage.objects for delete to authenticated using       (bucket_id='testimonials' and private.is_admin(auth.uid()));
create policy "Admins upload to articles"     on storage.objects for insert to authenticated with check (bucket_id='articles'     and private.is_admin(auth.uid()));
create policy "Admins update articles"        on storage.objects for update to authenticated using       (bucket_id='articles'     and private.is_admin(auth.uid()));
create policy "Admins delete articles"        on storage.objects for delete to authenticated using       (bucket_id='articles'     and private.is_admin(auth.uid()));

-- Instagram bucket: all admin ops
create policy "Admins manage instagram bucket" on storage.objects for all to authenticated
  using (bucket_id='instagram' and public.is_admin(auth.uid()))
  with check (bucket_id='instagram' and public.is_admin(auth.uid()));

-- ============================================================
-- 7. POST-MIGRATION — create your first admin (run manually)
-- ============================================================
-- 1. Auth → Users → Add user (email + password). Copy the user id.
-- 2. Then run:
--    insert into public.user_roles (user_id, role) values ('<paste-user-id>', 'super_admin');
