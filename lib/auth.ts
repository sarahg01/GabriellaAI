import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

/**
 * Returns the signed-in user's profile (including role), or null if no one
 * is signed in. Use this in Server Components / route handlers to decide
 * what to render or whether to allow an action.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", auth.user.id)
    .single();

  return (profile as Profile) ?? null;
}
