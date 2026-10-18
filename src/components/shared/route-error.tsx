"use client";

import { useEffect } from "react";
import Link from "next/link";

import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

export interface RouteErrorProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

/** Shared body for every dashboard error.tsx boundary. */
export function RouteError({
  error,
  unstable_retry,
  homeHref = "/dashboard",
}: RouteErrorProps & { homeHref?: string }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <ErrorState
        error={error}
        title="We couldn't load this page"
        onRetry={unstable_retry}
        className="w-full max-w-xl"
      />
      <Button variant="link" asChild>
        <Link href={homeHref}>Back to dashboard</Link>
      </Button>
    </div>
  );
}
