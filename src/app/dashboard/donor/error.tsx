"use client";

import { RouteError, type RouteErrorProps } from "@/components/shared/route-error";

export default function DonorError(props: RouteErrorProps) {
  return <RouteError {...props} homeHref="/dashboard/donor" />;
}
