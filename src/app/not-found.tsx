import type { Metadata } from "next";
import Link from "next/link";
import { DropletIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found — BloodBridge" };

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <div className="relative">
        <DropletIcon className="size-24 fill-primary/10 text-primary" aria-hidden />
        <span className="absolute inset-0 flex items-center justify-center pt-4 text-xl font-bold text-primary">
          404
        </span>
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Open dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
