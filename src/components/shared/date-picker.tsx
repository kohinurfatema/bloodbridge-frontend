"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import type { Matcher } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate, toApiDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  id?: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  onBlur?: () => void;
  disabled?: Matcher | Matcher[];
  placeholder?: string;
  invalid?: boolean;
}

export function DatePicker({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  placeholder = "Pick a date",
  invalid,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) onBlur?.();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-invalid={invalid}
          className={cn("w-full justify-start font-normal", !value && "text-muted-foreground")}
        >
          <CalendarIcon aria-hidden />
          {value ? formatDate(toApiDate(value)) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value}
          disabled={disabled}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
