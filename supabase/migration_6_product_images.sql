-- Migration: support multiple images per product (swipeable gallery).
-- Safe to run on the existing live database — only adds a new table + policies,
-- does not touch existing products/product_links data.
--
-- App-level cap: the UI limits admins to 10 images per product. That's not
-- enforced here at the DB level to keep this simple, but nothing stops you
-- from adding a `check` constraint on a per-product count later if you want
-- it enforced server-side too.

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_id_idx
  on public.product_images(product_id);

alter table public.product_images enable row level security;

drop policy if exists "product_images: signed-in users can read" on public.product_images;
create policy "product_images: signed-in users can read"
  on public.product_images for select
  to authenticated
  using (true);

drop policy if exists "product_images: admins can insert" on public.product_images;
create policy "product_images: admins can insert"
  on public.product_images for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "product_images: admins can update" on public.product_images;
create policy "product_images: admins can update"
  on public.product_images for update
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "product_images: admins can delete" on public.product_images;
create policy "product_images: admins can delete"
  on public.product_images for delete
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Note: products.image_url is kept as-is and still required. The app treats
-- it as the "cover" image / image #1 for backward compatibility, and stores
-- the *full* gallery (including that same cover shot, ideally) in
-- product_images. Existing products keep working unchanged until you edit
-- them and add extra gallery images.
