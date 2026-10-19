"use client";

import { useRef } from "react";

import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string> {
  value: T;
  label: React.ReactNode;
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
}

/**
 * Tab-styled filter that changes a list in place. It's a radio group, not
 * Tabs, because there are no separate tab panels to point at.
 * Arrow keys move between options (roving tabindex).
 */
export function SegmentedControl<T extends string>({ label, value, options, onChange }: SegmentedControlProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div role="radiogroup" aria-label={label} className="inline-flex h-9 items-center gap-1 rounded-lg bg-muted p-1 text-muted-foreground">
        {options.map((option, i) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected ? "bg-background text-foreground shadow-sm" : "hover:text-foreground",
              )}
            >
              {option.label}
              {option.count !== undefined && (
                <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">{option.count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
