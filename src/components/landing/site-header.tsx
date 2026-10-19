import Link from "next/link";

import { AuthActions } from "@/components/landing/auth-actions";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#compatibility", label: "Compatibility" },
  { href: "#features", label: "Features" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-6 text-sm md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <AuthActions />
        </div>
      </div>
    </header>
  );
}
