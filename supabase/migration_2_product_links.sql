-- Migration: support multiple buy links and multiple review links per product.
-- Safe to run on the existing live database — only adds a new table + policies,
-- does not touch existing products/profiles/clicks data.

create extension if not exists "pgcrypto";

create table if not exists public.product_links (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  link_type text not null check (link_type in ('buy', 'review')),
  label text,                    -- e.g. "Nykaa", "Amazon", "Instagram Reel"
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_links_product_id_idx
  on public.product_links(product_id);

alter table public.product_links enable row level security;

drop policy if exists "product_links: signed-in users can read" on public.product_links;
create policy "product_links: signed-in users can read"
  on public.product_links for select
  to authenticated
  using (true);

drop policy if exists "product_links: admins can insert" on public.product_links;
create policy "product_links: admins can insert"
  on public.product_links for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "product_links: admins can update" on public.product_links;
create policy "product_links: admins can update"
  on public.product_links for update
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "product_links: admins can delete" on public.product_links;
create policy "product_links: admins can delete"
  on public.product_links for delete
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Note: products.affiliate_url and products.youtube_review_url are kept as-is.
-- The app now treats them as a "primary" buy/review link for backward
-- compatibility, and stores the *full* list of buy/review links in
-- product_links. You don't need to change or backfill anything — existing
-- products will keep working exactly as before until you edit them.
