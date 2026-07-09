import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

/**
 * Returns the signed-in user's profile (including role), or null if no one
 * is signed in. Use this in Server Components / route handlers to decide
 * what to render or whether to allow an action.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", auth.user.id)
    .single();

  if (profile) return profile as Profile;

  // Fallback so admin access can never silently break due to a missing
  // profile row, a trigger that didn't fire, or an RLS issue — matches
  // the hardcoded check already used in middleware.ts and admin pages.
  if (auth.user.email === "sarahgabriel0001@gmail.com") {
    return {
      id: auth.user.id,
      email: auth.user.email,
      role: "admin",
      created_at: auth.user.created_at,
    } as Profile;
  }

  return null;
}
