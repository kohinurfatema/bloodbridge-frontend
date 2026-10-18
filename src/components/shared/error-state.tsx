"use client";

import { RotateCwIcon, TriangleAlertIcon, WifiOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  error?: unknown;
  title?: string;
  onRetry?: () => void;
  className?: string;
}

function describe(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 0) return "You appear to be offline. Check your connection and try again.";
    if (error.status === 401) return "Your session has expired. Please log in again.";
    if (error.status === 403) return "You don't have permission to view this.";
    if (error.status === 429) return "Too many requests. Please wait a moment and try again.";
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
}

/** Reusable error UI for route error boundaries and failed queries. */
export function ErrorState({
  error,
  title = "Something went wrong",
  onRetry,
  className,
}: ErrorStateProps) {
  const offline = error instanceof ApiError && error.status === 0;
  const Icon = offline ? WifiOffIcon : TriangleAlertIcon;
  const digest =
    error && typeof error === "object" && "digest" in error
      ? String((error as { digest?: string }).digest ?? "")
      : "";

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-destructive/30 bg-destructive/5 px-6 py-12 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <Icon className="size-6" aria-hidden />
      </span>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="max-w-md text-sm text-muted-foreground">{describe(error)}</p>
        {digest && (
          <p className="font-mono text-xs text-muted-foreground/70">Error ID: {digest}</p>
        )}
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RotateCwIcon /> Try again
        </Button>
      )}
    </div>
  );
}
