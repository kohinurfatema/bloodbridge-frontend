import Link from "next/link";
import {
  ArrowRightIcon,
  BellRingIcon,
  CalendarHeartIcon,
  CheckCircle2Icon,
  ClipboardPenIcon,
  CreditCardIcon,
  DropletIcon,
  HandHeartIcon,
  HeartHandshakeIcon,
  LockKeyholeIcon,
  PhoneIcon,
  SearchIcon,
  ShieldCheckIcon,
  SirenIcon,
  UserCheckIcon,
} from "lucide-react";

import { CompatibilityExplorer } from "@/components/landing/compatibility-explorer";
import { SiteHeader } from "@/components/landing/site-header";
import { Logo } from "@/components/shared/logo";
import { BloodTypeBadge, StatusBadge, UrgencyBadge } from "@/components/shared/status-badges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Server Component — the whole page is static HTML except the header's
// auth buttons and the compatibility explorer.

const STEPS = [
  {
    role: "Requester",
    icon: ClipboardPenIcon,
    title: "Post a request",
    text: "Blood type, units, hospital and how urgent it is. Emergencies raise an alert instantly.",
  },
  {
    role: "Admin",
    icon: UserCheckIcon,
    title: "We match a donor",
    text: "Our team picks an available donor with the same blood type, nearest first.",
  },
  {
    role: "Donor",
    icon: HandHeartIcon,
    title: "Donor accepts & donates",
    text: "The donor accepts, their contact is shared, and the donation is recorded.",
  },
];

const FEATURES = [
  { icon: SirenIcon, title: "Emergency alerts", text: "Life-threatening requests are flagged on every donor's dashboard until resolved." },
  { icon: SearchIcon, title: "Donor search", text: "Filter available donors by blood type and location, sorted by who's rested longest." },
  { icon: CalendarHeartIcon, title: "Eligibility tracking", text: "The 56-day recovery window is tracked, so donors know exactly when they can give again." },
  { icon: LockKeyholeIcon, title: "Private by default", text: "Phone numbers are only revealed after a donor accepts a match." },
  { icon: CreditCardIcon, title: "Secure payments", text: "Service fees are paid through Stripe Checkout — card details never touch our servers." },
  { icon: ShieldCheckIcon, title: "Audited & role-based", text: "Separate donor, requester and admin portals, with every key action logged." },
];

function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden>
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-2xl" />
      <Card className="rotate-1 shadow-xl">
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <BloodTypeBadge type="O_NEG" size="lg" />
            <div className="flex-1 space-y-1">
              <p className="font-semibold">Square Hospital, Dhaka</p>
              <div className="flex flex-wrap gap-1.5">
                <UrgencyBadge urgency="EMERGENCY" />
                <StatusBadge status="MATCHED" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">TR</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">Tanvir Rahman accepted</p>
              <p className="text-xs text-muted-foreground">O− donor · 2.1 km away</p>
            </div>
            <Badge variant="outline">
              <PhoneIcon /> Call
            </Badge>
          </div>
        </CardContent>
      </Card>
      <Card className="absolute -bottom-10 left-2 w-56 -rotate-3 shadow-lg sm:-left-12">
        <CardContent className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
            <CheckCircle2Icon className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">Donation recorded</p>
            <p className="text-xs text-muted-foreground">Up to 3 lives helped</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      {/* overflow-x-clip: decorative glows and tilted cards must never cause sideways scroll */}
      <main id="main-content" className="flex-1 overflow-x-clip">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-16 px-4 py-16 md:py-24 lg:grid-cols-2">
          <div className="space-y-6">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <DropletIcon className="fill-current" /> Blood donation & emergency network
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Find blood donors in <span className="text-primary">minutes</span>, not hours.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              BloodBridge connects patients with verified, available donors near them — with emergency
              alerts, eligibility tracking and an admin team that makes every match.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register?role=REQUESTER">
                  Request blood <ArrowRightIcon />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/register?role=DONOR">
                  <HandHeartIcon /> Become a donor
                </Link>
              </Button>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
              {["All 8 blood types", "56-day eligibility tracking", "Stripe-secured payments"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <CheckCircle2Icon className="size-4 text-primary" aria-hidden /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="pb-10">
            <HeroPreview />
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 border-y bg-muted/30">
          <div className="mx-auto max-w-6xl space-y-10 px-4 py-16 md:py-20">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
              <p className="text-muted-foreground">Three roles, one workflow — from request to donation.</p>
            </div>
            <ol className="grid gap-6 md:grid-cols-3">
              {STEPS.map(({ role, icon: Icon, title, text }, i) => (
                <li key={title}>
                  <Card className="h-full">
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                          <Icon className="size-5" aria-hidden />
                        </span>
                        {/* Decorative step number drawn via ::before so it isn't read or contrast-checked */}
                        <span
                          aria-hidden
                          data-step={`0${i + 1}`}
                          className="text-4xl font-bold text-muted-foreground/20 before:content-[attr(data-step)]"
                        />
                      </div>
                      <div className="space-y-1">
                        <Badge variant="secondary">{role}</Badge>
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <p className="text-sm text-muted-foreground">{text}</p>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Compatibility */}
        <section id="compatibility" className="mx-auto max-w-6xl scroll-mt-20 space-y-10 px-4 py-16 md:py-20">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Who can you help?</h2>
            <p className="text-muted-foreground">
              Pick a blood type to see who it can donate to and receive from.
            </p>
          </div>
          <CompatibilityExplorer />
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 border-t bg-muted/30">
          <div className="mx-auto max-w-6xl space-y-10 px-4 py-16 md:py-20">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Built for emergencies</h2>
              <p className="text-muted-foreground">Everything a blood bank coordinator would ask for.</p>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="space-y-1">
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="brand-surface relative overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12">
            <DropletIcon className="pointer-events-none absolute -top-10 -right-10 size-64 fill-white/10 text-transparent" aria-hidden />
            <div className="relative mx-auto max-w-xl space-y-4">
              <HeartHandshakeIcon className="mx-auto size-10" aria-hidden />
              <h2 className="text-3xl font-bold tracking-tight">One donation can save three lives.</h2>
              <p className="opacity-90">
                Register as a donor today — it takes two minutes, and we&apos;ll only reach out when
                someone with your blood type needs you.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/register?role=DONOR">Become a donor</Link>
                </Button>
                <Button size="lg" variant="ghost" asChild className="text-current hover:bg-white/10 hover:text-current">
                  <Link href="/login">
                    <BellRingIcon /> Try a demo account
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} BloodBridge. Connecting donors with patients.</p>
        </div>
      </footer>
    </>
  );
}
