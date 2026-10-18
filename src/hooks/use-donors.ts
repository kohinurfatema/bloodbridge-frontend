"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { type DonorSearchParams, donorService } from "@/services/donor.service";

export function useDonorSearch(params: DonorSearchParams) {
  return useQuery({
    queryKey: queryKeys.donors(params),
    queryFn: () => donorService.search(params),
    // Keep showing the current page while the next one loads.
    placeholderData: keepPreviousData,
  });
}
