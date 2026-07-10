-- ProductBoard — Supabase schema
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).
-- Safe to re-run: it drops and recreates the objects it owns.

-- ============================================================================
-- 1. PROFILES — one row per auth user, holds the app role
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- SECURITY DEFINER: lets this function read profiles for its own internal
-- check without re-triggering RLS on profiles itself. Any policy (on
-- profiles or any other table) that needs to check "is this user an admin?"
-- should call this function rather than writing its own subquery on
-- profiles — a subquery on profiles inside a policy ON profiles causes
-- Postgres to recurse into that same policy forever ("infinite recursion
-- detected in policy for relation 'profiles'", error 42P17).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "profiles: read own row" on public.profiles;
create policy "profiles: read own row"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles: admins read all" on public.profiles;
create policy "profiles: admins read all"
  on public.profiles for select
  using (public.is_admin());

-- New users get a profile automatically. The very first person to ever sign
-- up becomes an admin so there's always at least one admin account; everyone
-- after that starts as a regular user. Promote more admins later by running:
--   update public.profiles set role = 'admin' where email = 'someone@example.com';
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_first_user boolean;
begin
  select not exists (select 1 from public.profiles) into is_first_user;

  insert into public.profiles (id, email, role)
  values (new.id, new.email, case when is_first_user then 'admin' else 'user' end);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- 2. PRODUCTS — the items shown on the Explore page
-- ============================================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null default 'Unbranded',
  description text,
  price numeric not null default 0,
  category text not null default 'skincare',
  image_url text not null,
  affiliate_url text not null,
  youtube_review_url text,
  buy_clicks integer not null default 0,
  review_clicks integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists products_created_at_idx on public.products (created_at desc);
create index if not exists products_buy_clicks_idx on public.products (buy_clicks desc);

alter table public.products enable row level security;

drop policy if exists "products: signed-in users can read" on public.products;
create policy "products: signed-in users can read"
  on public.products for select
  using (auth.role() = 'authenticated');

drop policy if exists "products: admins can insert" on public.products;
create policy "products: admins can insert"
  on public.products for insert
  with check (
    public.is_admin()
  );

drop policy if exists "products: admins can update" on public.products;
create policy "products: admins can update"
  on public.products for update
  using (
    public.is_admin()
  );

drop policy if exists "products: admins can delete" on public.products;
create policy "products: admins can delete"
  on public.products for delete
  using (
    public.is_admin()
  );

-- ============================================================================
-- 3. CLICKS — one row per buy/review click, used to drive the counters above
-- ============================================================================
create table if not exists public.clicks (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  click_type text not null check (click_type in ('buy', 'review')),
  user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists clicks_product_id_idx on public.clicks (product_id);

alter table public.clicks enable row level security;

drop policy if exists "clicks: signed-in users can log a click" on public.clicks;
create policy "clicks: signed-in users can log a click"
  on public.clicks for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "clicks: admins can read" on public.clicks;
create policy "clicks: admins can read"
  on public.clicks for select
  using (
    public.is_admin()
  );

-- Every click bumps the matching counter on the product. The function runs
-- as its owner (security definer) so a normal user's insert into "clicks" is
-- enough to update "products" without needing a separate update policy.
create or replace function public.handle_new_click()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.click_type = 'buy' then
    update public.products set buy_clicks = buy_clicks + 1 where id = new.product_id;
  else
    update public.products set review_clicks = review_clicks + 1 where id = new.product_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_click_created on public.clicks;
create trigger on_click_created
  after insert on public.clicks
  for each row execute procedure public.handle_new_click();
