import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup"];

// You are always treated as admin, regardless of what the profiles table
// says. This matches the rest of the app (admin pages already hardcode
// this check) and means admin access can't silently break due to a
// missing profile row, a stale session, or an RLS/trigger issue.
const HARDCODED_ADMIN_EMAIL = "sarahgabriel0001@gmail.com";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const path = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.some((p) => path.startsWith(p));

  // Signed-out visitor hitting a protected page -> send to login.
  if (!user && !isPublicPath) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  // Already signed in -> skip the login/signup forms.
  if (user && isPublicPath) {
    return NextResponse.redirect(new URL("/explore", request.url));
  }

  // Admin-only area: confirm role before letting the request through.
  if (user && path.startsWith("/admin")) {
    if (user.email !== HARDCODED_ADMIN_EMAIL) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/explore", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on everything except static assets and Next internals.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
