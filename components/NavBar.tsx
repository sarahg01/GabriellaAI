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
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-[#f5c1c5] text-ink">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:py-6">
        <Link href="/explore" className="font-display text-2xl font-bold tracking-tight text-ink">
          GabriellaAI
        </Link>

        <nav className="flex items-center gap-1 font-mono text-xs uppercase tracking-wide">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3 py-1.5 transition-colors hover:bg-ink/10 ${
                pathname?.startsWith(link.href) ? "bg-ink/10 text-clay" : "text-ink/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className={`rounded-full px-3 py-1.5 transition-colors hover:bg-ink/10 ${
                pathname?.startsWith("/admin") ? "bg-ink/10 text-clay" : "text-ink/70"
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-xs text-ink/60 sm:inline">{email}</span>
          <button
            onClick={signOut}
            className="rounded-full border border-ink/30 px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-ink/90 transition-colors hover:border-clay hover:text-clay"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
