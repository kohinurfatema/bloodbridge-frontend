"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ParamValue = string | number | boolean | null | undefined;

/**
 * Keeps filters and pagination in the URL so views are shareable,
 * survive refresh and work with the back button.
 */
export function useQueryParams() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const setParams = useCallback(
    (updates: Record<string, ParamValue>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === "" || value === false) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  return { searchParams, setParams };
}
