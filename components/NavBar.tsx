"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/saved", label: "Saved" },
  { href: "/trends", label: "Trends" },
];

export default function NavBar({
  isAdmin,
  email,
}: {
  isAdmin: boolean;
  email: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-mist/60 bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/explore" className="font-display text-lg font-bold tracking-tight">
          ProductBoard
        </Link>

        <nav className="flex items-center gap-1 font-mono text-xs uppercase tracking-wide">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3 py-1.5 transition-colors hover:bg-paper/10 ${
                pathname?.startsWith(link.href) ? "bg-paper/15 text-amber" : "text-paper/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className={`rounded-full px-3 py-1.5 transition-colors hover:bg-paper/10 ${
                pathname?.startsWith("/admin") ? "bg-paper/15 text-amber" : "text-paper/80"
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-xs text-paper/60 sm:inline">{email}</span>
          <button
            onClick={signOut}
            className="rounded-full border border-paper/30 px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-paper/90 transition-colors hover:border-amber hover:text-amber"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
