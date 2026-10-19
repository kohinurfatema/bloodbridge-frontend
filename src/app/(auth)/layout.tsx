import { DropletIcon, HeartPulseIcon, ShieldCheckIcon, UsersIcon } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const highlights = [
  { icon: HeartPulseIcon, text: "Emergency requests reach matching donors fast" },
  { icon: UsersIcon, text: "Search available donors by blood type and location" },
  { icon: ShieldCheckIcon, text: "Verified matches managed by our admin team" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Brand panel — hidden on small screens to keep the form first */}
      <aside className="brand-surface relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2 text-lg font-bold">
          <DropletIcon className="size-6 fill-current" aria-hidden />
          BloodBridge
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="max-w-md text-4xl leading-tight font-bold">
            Every drop counts. Every second matters.
          </h2>
          <ul className="space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 opacity-90">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Icon className="size-4" aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-sm">
          © {new Date().getFullYear()} BloodBridge. Connecting donors with patients.
        </p>

        <DropletIcon
          className="pointer-events-none absolute -right-24 -bottom-24 size-[28rem] fill-white/10 text-white/0"
          aria-hidden
        />
      </aside>

      <main id="main-content" className="flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Logo className="lg:invisible" />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}
