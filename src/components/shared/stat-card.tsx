import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  description?: string;
  icon: LucideIcon;
  tone?: "primary" | "amber" | "violet" | "emerald" | "sky";
}

const TONES = {
  primary: "bg-primary/10 text-primary",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  violet: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  sky: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
};

export function StatCard({ title, value, description, icon: Icon, tone = "primary" }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span className={cn("flex size-9 items-center justify-center rounded-lg", TONES[tone])}>
          <Icon className="size-4" aria-hidden />
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tabular-nums">{value}</div>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
