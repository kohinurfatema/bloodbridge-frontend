"use client";

import { RouteError, type RouteErrorProps } from "@/components/shared/route-error";

export default function RootError(props: RouteErrorProps) {
  return (
    <main className="flex flex-1 flex-col px-4 py-24">
      <RouteError {...props} homeHref="/" />
    </main>
  );
}
