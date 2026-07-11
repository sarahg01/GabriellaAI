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
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-2 px-4 py-4 sm:flex-nowrap sm:px-5 sm:py-5 md:py-6">
        <Link
          href="/explore"
          className="shrink-0 font-display text-xl font-bold tracking-tight text-ink sm:text-2xl"
        >
          GabriellaAI
        </Link>

        <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto whitespace-nowrap font-mono text-xs uppercase tracking-wide [-ms-overflow-style:none] [scrollbar-width:none] sm:order-none sm:w-auto sm:overflow-visible [&::-webkit-scrollbar]:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-full px-3 py-1.5 transition-colors hover:bg-ink/10 ${
                pathname?.startsWith(link.href) ? "bg-ink/10 text-clay" : "text-ink/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className={`shrink-0 rounded-full px-3 py-1.5 transition-colors hover:bg-ink/10 ${
                pathname?.startsWith("/admin") ? "bg-ink/10 text-clay" : "text-ink/70"
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden font-mono text-xs text-ink/60 md:inline">{email}</span>
          <button
            onClick={signOut}
            className="shrink-0 rounded-full border border-ink/30 px-2.5 py-1.5 font-mono text-xs uppercase tracking-wide text-ink/90 transition-colors hover:border-clay hover:text-clay sm:px-3"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
