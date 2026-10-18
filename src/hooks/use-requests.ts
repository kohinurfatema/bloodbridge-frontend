"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { MY_REQUESTS_LIMIT, queryKeys } from "@/lib/query-keys";
import { type CreateRequestInput, requestService } from "@/services/request.service";

export function useMyRequests() {
  return useQuery({
    queryKey: queryKeys.requests.mine,
    queryFn: () => requestService.listMine(1, MY_REQUESTS_LIMIT),
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRequestInput) => requestService.create(input),
    onSuccess: () => {
      // Lists, stats and alerts all depend on requests — refetch them.
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
    // Errors are shown inline in the form instead of a global toast.
    onError: () => {},
  });
}
