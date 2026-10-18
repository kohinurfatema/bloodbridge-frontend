"use client";

import { RouteError, type RouteErrorProps } from "@/components/shared/route-error";

export default function RequesterError(props: RouteErrorProps) {
  return <RouteError {...props} homeHref="/dashboard/requester" />;
}
