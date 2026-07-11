-- Migration: add a per-link price to product_links.
-- Lets each buy link (EarnKaro, CashKaro, Amazon, etc.) show its own price,
-- since the same product often sells for different amounts on different
-- platforms. Safe to run on the existing live database — only adds a
-- nullable column, no existing rows are affected.

alter table public.product_links
  add column if not exists price numeric(10, 2);

comment on column public.product_links.price is
  'Price for this specific buy/review link, in the same currency as products.price (INR). Nullable — falls back to the product''s overall price in the UI when not set.';
