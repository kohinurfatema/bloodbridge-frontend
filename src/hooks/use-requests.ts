"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MY_REQUESTS_LIMIT, queryKeys } from "@/lib/query-keys";
import { type CreateRequestInput, requestService } from "@/services/request.service";
import type { BloodRequest } from "@/types";

export function useMyRequests() {
  return useQuery({
    queryKey: queryKeys.requests.mine,
    queryFn: () => requestService.listMine(1, MY_REQUESTS_LIMIT),
  });
}

export function useRequest(id: string) {
  return useQuery({
    queryKey: queryKeys.requests.detail(id),
    queryFn: () => requestService.getById(id),
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

/** Cancels a pending request, updating the UI before the server responds. */
export function useCancelRequest(id: string) {
  const queryClient = useQueryClient();
  const key = queryKeys.requests.detail(id);

  return useMutation({
    mutationFn: () => requestService.updateStatus(id, "CANCELLED"),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<BloodRequest>(key);
      if (previous) {
        queryClient.setQueryData<BloodRequest>(key, { ...previous, status: "CANCELLED" });
      }
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error(error.message);
    },
    onSuccess: () => toast.success("Request cancelled."),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
    },
  });
}

export function useDeleteRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => requestService.remove(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.requests.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
      toast.success("Request deleted.");
    },
  });
}
