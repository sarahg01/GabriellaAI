-- Reconciles the live products table with what the app code actually uses.
-- Your database still had the original column names (title/buy_link/review_link)
-- and was missing price/category entirely — this had been silently masked
-- because the table was empty. Safe to run: only renames/adds columns,
-- does not delete anything.

alter table public.products rename column title to name;
alter table public.products rename column buy_link to affiliate_url;
alter table public.products rename column review_link to youtube_review_url;

alter table public.products add column if not exists price numeric not null default 0;
alter table public.products add column if not exists category text not null default 'skincare';
