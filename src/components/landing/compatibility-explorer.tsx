"use client";

import { useState } from "react";
import { ArrowDownLeftIcon, ArrowUpRightIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { BLOOD_TYPE_LABELS, BLOOD_TYPES, CAN_DONATE_TO } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { BloodType } from "@/types";

const canReceiveFrom = (type: BloodType) =>
  BLOOD_TYPES.filter((donor) => CAN_DONATE_TO[donor].includes(type));

function TypeList({ types, highlight }: { types: BloodType[]; highlight: BloodType }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {BLOOD_TYPES.map((t) => {
        const on = types.includes(t);
        return (
          <li
            key={t}
            className={cn(
              "flex h-10 w-12 items-center justify-center rounded-lg border text-sm font-bold",
              // Incompatible types: dashed + struck through, so it never relies on faintness alone
              on ? "border-primary/40 bg-primary/10 text-primary" : "border-dashed font-medium text-muted-foreground line-through",
              t === highlight && on && "ring-2 ring-primary/40",
            )}
          >
            <span className="sr-only">{on ? "Yes: " : "No: "}</span>
            {BLOOD_TYPE_LABELS[t]}
          </li>
        );
      })}
    </ul>
  );
}

/** Pick a blood type to see who it can give red cells to and receive from. */
export function CompatibilityExplorer() {
  const [type, setType] = useState<BloodType>("O_NEG");
  const giveTo = CAN_DONATE_TO[type];
  const receiveFrom = canReceiveFrom(type);

  return (
    <Card>
      <CardContent className="grid gap-8 lg:grid-cols-[auto_1fr]">
        <fieldset>
          <legend className="mb-3 text-sm font-medium">Your blood type</legend>
          <div className="grid grid-cols-4 gap-2" role="radiogroup">
            {BLOOD_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={type === t}
                onClick={() => setType(t)}
                className={cn(
                  "flex h-14 w-16 items-center justify-center rounded-xl border text-lg font-bold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  type === t ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                {BLOOD_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="space-y-6" aria-live="polite">
          <div className="space-y-3">
            <p className="flex items-center gap-2 font-medium">
              <ArrowUpRightIcon className="size-4 text-primary" aria-hidden />
              {BLOOD_TYPE_LABELS[type]} can donate to {giveTo.length === 8 ? "everyone" : `${giveTo.length} type${giveTo.length > 1 ? "s" : ""}`}
            </p>
            <TypeList types={giveTo} highlight={type} />
          </div>
          <div className="space-y-3">
            <p className="flex items-center gap-2 font-medium">
              <ArrowDownLeftIcon className="size-4 text-primary" aria-hidden />
              {BLOOD_TYPE_LABELS[type]} can receive from {receiveFrom.length === 8 ? "everyone" : `${receiveFrom.length} type${receiveFrom.length > 1 ? "s" : ""}`}
            </p>
            <TypeList types={receiveFrom} highlight={type} />
          </div>
          <p className="text-xs text-muted-foreground">
            Red-cell compatibility. BloodBridge matches donors with the exact requested type for safety.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
