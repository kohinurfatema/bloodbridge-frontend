import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  ClockIcon,
  LinkIcon,
  SirenIcon,
  XCircleIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { BLOOD_TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type {
  BloodType,
  MatchStatus,
  PaymentStatus,
  RequestStatus,
  Urgency,
} from "@/types";

export function BloodTypeBadge({
  type,
  size = "md",
  className,
}: {
  type: BloodType;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary ring-1 ring-primary/20",
        size === "sm" && "size-8 text-xs",
        size === "md" && "size-10 text-sm",
        size === "lg" && "size-14 text-lg",
        className,
      )}
      aria-label={`Blood type ${BLOOD_TYPE_LABELS[type]}`}
    >
      {BLOOD_TYPE_LABELS[type]}
    </span>
  );
}

const URGENCY_STYLES: Record<Urgency, { className: string; icon: typeof ClockIcon }> = {
  NORMAL: { className: "bg-sky-500/10 text-sky-700 dark:text-sky-300", icon: ClockIcon },
  URGENT: { className: "bg-amber-500/15 text-amber-700 dark:text-amber-300", icon: AlertTriangleIcon },
  EMERGENCY: { className: "bg-red-500/15 text-red-700 dark:text-red-300", icon: SirenIcon },
};

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const { className, icon: Icon } = URGENCY_STYLES[urgency];
  return (
    <Badge variant="secondary" className={cn("capitalize", className)}>
      <Icon aria-hidden /> {urgency.toLowerCase()}
    </Badge>
  );
}

type AnyStatus = RequestStatus | MatchStatus | PaymentStatus;

const STATUS_STYLES: Record<AnyStatus, { className: string; icon: typeof ClockIcon }> = {
  PENDING: { className: "bg-amber-500/15 text-amber-700 dark:text-amber-300", icon: CircleDashedIcon },
  MATCHED: { className: "bg-violet-500/15 text-violet-700 dark:text-violet-300", icon: LinkIcon },
  ACCEPTED: { className: "bg-violet-500/15 text-violet-700 dark:text-violet-300", icon: CheckCircle2Icon },
  FULFILLED: { className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300", icon: CheckCircle2Icon },
  COMPLETED: { className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300", icon: CheckCircle2Icon },
  CANCELLED: { className: "bg-muted text-muted-foreground", icon: XCircleIcon },
  DECLINED: { className: "bg-muted text-muted-foreground", icon: XCircleIcon },
  FAILED: { className: "bg-red-500/15 text-red-700 dark:text-red-300", icon: XCircleIcon },
  REFUNDED: { className: "bg-sky-500/10 text-sky-700 dark:text-sky-300", icon: CircleDashedIcon },
};

export function StatusBadge({ status }: { status: AnyStatus }) {
  const { className, icon: Icon } = STATUS_STYLES[status];
  return (
    <Badge variant="secondary" className={cn("capitalize", className)}>
      <Icon aria-hidden /> {status.toLowerCase()}
    </Badge>
  );
}
