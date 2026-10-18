"use client";

import { useQuery } from "@tanstack/react-query";

import { MY_REQUESTS_LIMIT, queryKeys } from "@/lib/query-keys";
import { requestService } from "@/services/request.service";

export function useMyRequests() {
  return useQuery({
    queryKey: queryKeys.requests.mine,
    queryFn: () => requestService.listMine(1, MY_REQUESTS_LIMIT),
  });
}
