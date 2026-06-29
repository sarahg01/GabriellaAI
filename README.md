# ProductBoard

A Pinterest-style product board. Admins add products (image, buying link,
YouTube review link); everyone signed in can browse Explore and see what's
trending on the Trends page. Admins get a small dashboard: product count,
brand count, and the highest-clicked products.

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Supabase (Postgres + Auth) — no separate server needed
- **Auth/roles:** Supabase Auth, with a `role` column (`user` / `admin`) on a `profiles` table
- **Deploy:** GitHub → Vercel (free tier works fine)

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com), create a free project.
2. In the project, open **SQL Editor → New query**, paste the entire contents
   of [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates:
   - `profiles` — one row per user, with a `role` (`user`/`admin`)
   - `products` — everything shown on Explore
   - `clicks` — one row per Buy/Watch-review click
   - Triggers that auto-create a profile on signup and auto-increment a
     product's click counters whenever a click is logged.
3. **The first person to sign up becomes admin automatically.** Anyone after
   that starts as a regular `user`. To promote someone else later, run in the
   SQL editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'someone@example.com';
   ```
4. Go to **Settings → API** and copy the **Project URL** and **anon public key**
   — you'll need them in the next step.

> By default Supabase emails a confirmation link on signup. For local testing
> you can turn that off in **Authentication → Providers → Email → "Confirm email"**.

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local` with the URL and anon key from step 1.4. These two
values are safe to expose to the browser — Row Level Security in
`schema.sql` is what actually protects the data.

## 3. Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up — your first
account becomes the admin. You'll be able to see **Admin → + Add product**.

## 4. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

(`.env.local` is already in `.gitignore` — your Supabase keys won't be committed.)

## 5. Deploy from GitHub (Vercel)

Next.js needs a Node server for auth middleware and API routes, so plain
GitHub Pages (static hosting) won't run this app — but deploying straight
from your GitHub repo is still one click away:

1. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import
   the GitHub repo you just pushed.
2. In **Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same values as your `.env.local`).
3. Click **Deploy**. Every future `git push` to `main` auto-deploys.

(Netlify and Render also work the same way — import the repo, set the two
env vars, deploy. Vercel is the most plug-and-play for Next.js.)

## How it's organized

```
app/
  login/, signup/          sign in / create account
  explore/                 Pinterest-style board (everyone signed in)
  trends/                  ranked by total clicks
  admin/                   counts + top-clicked products (admins only)
  admin/products/new/      add-product form (admins only)
  api/click/                logs a Buy/Watch-review click
components/
  NavBar, MasonryGrid, ProductCard
lib/supabase/             browser + server Supabase clients
middleware.ts             session refresh + route guards (auth + admin-only)
supabase/schema.sql       tables, RLS policies, triggers
```

## How roles and protection work

- **Route guarding** happens in `middleware.ts`: signed-out visitors are sent
  to `/login`; non-admins are bounced out of `/admin`.
- **Data protection** happens in Postgres via Row Level Security
  (`supabase/schema.sql`) — even if someone bypassed the UI, the database
  itself only lets admins insert/update/delete products.
- **Click counters** (`buy_clicks` / `review_clicks` on `products`) are kept
  in sync by a Postgres trigger every time a row is inserted into `clicks`,
  so Trends and the Admin dashboard are just a sorted read of `products` —
  no separate aggregation step needed.

## Customizing

- **Design tokens** (colors, fonts) live in `tailwind.config.ts` and the
  `next/font/google` setup in `app/layout.tsx`.
- Want product images uploaded instead of pasted by URL? Add a Supabase
  Storage bucket and swap the "Image URL" field in
  `app/admin/products/new/page.tsx` for a file input that uploads to it.
