import Link from "next/link";
import { DropletIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 text-lg font-bold tracking-tight", className)}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <DropletIcon className="size-4 fill-current" aria-hidden />
      </span>
      BloodBridge
    </Link>
  );
}
