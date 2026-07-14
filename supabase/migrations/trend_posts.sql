-- ============================================================================
-- TREND POSTS — Instagram reels shown on the Trends page, each optionally
-- linked to a product so its existing buy links can be shown underneath.
-- ============================================================================
create table if not exists public.trend_posts (
  id uuid primary key default gen_random_uuid(),
  instagram_url text not null,
  caption text,
  product_id uuid references public.products (id) on delete set null,
  sort_order integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists trend_posts_sort_order_idx
  on public.trend_posts (sort_order, created_at desc);

alter table public.trend_posts enable row level security;

drop policy if exists "trend_posts: signed-in users can read" on public.trend_posts;
create policy "trend_posts: signed-in users can read"
  on public.trend_posts for select
  to authenticated
  using (true);

drop policy if exists "trend_posts: admins can insert" on public.trend_posts;
create policy "trend_posts: admins can insert"
  on public.trend_posts for insert
  with check (public.is_admin());

drop policy if exists "trend_posts: admins can update" on public.trend_posts;
create policy "trend_posts: admins can update"
  on public.trend_posts for update
  using (public.is_admin());

drop policy if exists "trend_posts: admins can delete" on public.trend_posts;
create policy "trend_posts: admins can delete"
  on public.trend_posts for delete
  using (public.is_admin());
