"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/client";
import { MY_MATCHES_LIMIT, queryKeys } from "@/lib/query-keys";
import { alertService } from "@/services/alert.service";
import { type DonorProfileInput, donorService } from "@/services/donor.service";
import { type MatchResponse, matchService } from "@/services/match.service";
import type { DonationMatch, DonorProfile, PaginationMeta } from "@/types";

// A donor without a profile gets a 404 — treat that as "no profile yet".
export async function fetchDonorProfileOrNull() {
  try {
    return await donorService.getMyProfile();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function useDonorProfile() {
  return useQuery({
    queryKey: queryKeys.donorProfile,
    queryFn: fetchDonorProfileOrNull,
  });
}

export function useMyMatches(enabled = true) {
  return useQuery({
    queryKey: queryKeys.matches.mine,
    queryFn: () => matchService.listMine(1, MY_MATCHES_LIMIT),
    enabled,
  });
}

export function useActiveAlerts() {
  return useQuery({
    queryKey: queryKeys.alerts({ active: true }),
    queryFn: () => alertService.list({ active: true, limit: 20 }),
  });
}

/** Flips availability instantly, rolling back if the server rejects it. */
export function useUpdateAvailability() {
  const queryClient = useQueryClient();
  const key = queryKeys.donorProfile;

  return useMutation({
    mutationFn: (isAvailable: boolean) => donorService.updateMyProfile({ isAvailable }),
    onMutate: async (isAvailable) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<DonorProfile | null>(key);
      if (previous) queryClient.setQueryData<DonorProfile>(key, { ...previous, isAvailable });
      return { previous };
    },
    onError: (error, _vars, context) => {
      queryClient.setQueryData(key, context?.previous);
      toast.error(error.message);
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(key, profile);
      toast.success(
        profile.isAvailable
          ? "You're now visible to people searching for donors."
          : "You're hidden from donor search.",
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["donors"] }),
  });
}

export function useSaveDonorProfile(exists: boolean) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DonorProfileInput) =>
      exists ? donorService.updateMyProfile(input) : donorService.register(input),
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.donorProfile, profile);
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
      queryClient.invalidateQueries({ queryKey: ["donors"] });
    },
    onError: () => {},
  });
}

type MatchList = { matches: DonationMatch[]; meta: PaginationMeta };

const RESPONSE_TOASTS: Record<MatchResponse, string> = {
  ACCEPTED: "Thank you! The requester can now see your contact details.",
  DECLINED: "Match declined. We'll look for another donor.",
  COMPLETED: "Donation recorded. You've helped save a life! ❤️",
};

/**
 * Accept / decline / complete a match. The card updates instantly and
 * rolls back if the server rejects the change.
 */
export function useRespondToMatch() {
  const queryClient = useQueryClient();
  const key = queryKeys.matches.mine;

  return useMutation({
    mutationFn: ({ id, response }: { id: string; response: MatchResponse }) =>
      matchService.respond(id, response),
    onMutate: async ({ id, response }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MatchList>(key);
      if (previous) {
        queryClient.setQueryData<MatchList>(key, {
          ...previous,
          matches: previous.matches.map((m) => (m.id === id ? { ...m, status: response } : m)),
        });
      }
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error(error.message);
    },
    onSuccess: (_data, { response }) => toast.success(RESPONSE_TOASTS[response]),
    onSettled: () => {
      // Responding changes availability, donation count and request status.
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.donorProfile });
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
    },
  });
}
