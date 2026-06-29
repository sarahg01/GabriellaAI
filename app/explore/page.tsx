import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import NavBar from "@/components/NavBar";
import MasonryGrid from "@/components/MasonryGrid";
import type { Product } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const supabase = createClient();
  const profile = await getCurrentProfile();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-paper">
      <NavBar isAdmin={profile?.role === "admin"} email={profile?.email ?? ""} />

      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink">Explore</h1>
          <p className="mt-1 text-sm text-ink/60">
            Every product on the board, newest first. Tap Buy or Watch review to go straight to
            the source.
          </p>
        </div>

        <MasonryGrid products={(products as Product[]) ?? []} />
      </main>
    </div>
  );
}
