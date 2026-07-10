-- Fixes "infinite recursion detected in policy for relation profiles" (42P17).
-- Cause: "profiles: admins read all" queries public.profiles from inside a
-- policy ON public.profiles, which re-triggers the same policy forever.
-- Every other admin-check policy (products, clicks, product_links) has the
-- same subquery shape and would eventually hit the same wall.
--
-- Fix: a SECURITY DEFINER function bypasses RLS for its internal query, so
-- checking "is this user an admin?" no longer re-enters profiles' own RLS.

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

-- profiles
drop policy if exists "profiles: admins read all" on public.profiles;
create policy "profiles: admins read all"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

-- products
drop policy if exists "products: admins can insert" on public.products;
create policy "products: admins can insert"
  on public.products for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "products: admins can update" on public.products;
create policy "products: admins can update"
  on public.products for update
  to authenticated
  using (public.is_admin());

drop policy if exists "products: admins can delete" on public.products;
create policy "products: admins can delete"
  on public.products for delete
  to authenticated
  using (public.is_admin());

-- clicks
drop policy if exists "clicks: admins can read" on public.clicks;
create policy "clicks: admins can read"
  on public.clicks for select
  to authenticated
  using (public.is_admin());

-- product_links (from migration_2)
drop policy if exists "product_links: admins can insert" on public.product_links;
create policy "product_links: admins can insert"
  on public.product_links for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "product_links: admins can update" on public.product_links;
create policy "product_links: admins can update"
  on public.product_links for update
  to authenticated
  using (public.is_admin());

drop policy if exists "product_links: admins can delete" on public.product_links;
create policy "product_links: admins can delete"
  on public.product_links for delete
  to authenticated
  using (public.is_admin());
