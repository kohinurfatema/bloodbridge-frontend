"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BLOOD_TYPE_LABELS, BLOOD_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { BloodType } from "@/types";

interface BloodTypePickerProps {
  value?: BloodType;
  onChange: (value: BloodType) => void;
  invalid?: boolean;
}

/** Large tappable grid of the 8 blood types, keyboard-navigable as a radio group. */
export function BloodTypePicker({ value, onChange, invalid }: BloodTypePickerProps) {
  return (
    <RadioGroup
      value={value ?? ""}
      onValueChange={(v) => onChange(v as BloodType)}
      aria-invalid={invalid}
      className="grid grid-cols-4 gap-2"
    >
      {BLOOD_TYPES.map((type) => (
        <label
          key={type}
          className={cn(
            "flex h-12 cursor-pointer items-center justify-center rounded-lg border text-base font-bold transition-colors hover:bg-muted",
            "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
            invalid && !value && "border-destructive/50",
            value === type && "border-primary bg-primary text-primary-foreground hover:bg-primary",
          )}
        >
          <RadioGroupItem value={type} className="sr-only" aria-label={BLOOD_TYPE_LABELS[type]} />
          {BLOOD_TYPE_LABELS[type]}
        </label>
      ))}
    </RadioGroup>
  );
}
