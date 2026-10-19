"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/lib/query-keys";
import { type AdminUserParams, adminService } from "@/services/admin.service";
import { type DonorSearchParams, donorService } from "@/services/donor.service";
import { type CreateMatchInput, matchService } from "@/services/match.service";
import { requestService } from "@/services/request.service";
import type { AdminUserRow, BloodRequest, PaginationMeta, RequestStatus } from "@/types";

type UserList = { users: AdminUserRow[]; meta: PaginationMeta };
const USERS_PREFIX = ["admin", "users"] as const;

export function useAdminUsers(params: AdminUserParams) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => adminService.listUsers(params),
    placeholderData: keepPreviousData,
  });
}

/**
 * Activates / deactivates a user. Every cached page of the user table is
 * patched immediately and restored if the request fails.
 */
export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: AdminUserRow) => adminService.toggleUserStatus(user.id),
    onMutate: async (user) => {
      await queryClient.cancelQueries({ queryKey: USERS_PREFIX });
      const snapshot = queryClient.getQueriesData<UserList>({ queryKey: USERS_PREFIX });
      queryClient.setQueriesData<UserList>({ queryKey: USERS_PREFIX }, (old) =>
        old && {
          ...old,
          users: old.users.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)),
        },
      );
      return { snapshot };
    },
    onError: (error, _user, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error(error.message);
    },
    onSuccess: (updated) =>
      toast.success(`${updated.name} ${updated.isActive ? "activated" : "deactivated"}.`),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USERS_PREFIX });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: AdminUserRow) => adminService.deleteUser(user.id),
    onSuccess: (_data, user) => {
      toast.success(`${user.name} was deleted.`);
      queryClient.invalidateQueries({ queryKey: USERS_PREFIX });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
    },
  });
}

type RequestList = { requests: BloodRequest[]; meta: PaginationMeta };
const REQUEST_LISTS = ["requests", "list"] as const;

/** Admin status change (e.g. fulfil / cancel), applied optimistically to every cached list page. */
export function useAdminRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
      requestService.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: REQUEST_LISTS });
      const snapshot = queryClient.getQueriesData<RequestList>({ queryKey: REQUEST_LISTS });
      queryClient.setQueriesData<RequestList>({ queryKey: REQUEST_LISTS }, (old) =>
        old && { ...old, requests: old.requests.map((r) => (r.id === id ? { ...r, status } : r)) },
      );
      return { snapshot };
    },
    onError: (error, _vars, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error(error.message);
    },
    onSuccess: (_data, { status }) => toast.success(`Request marked as ${status.toLowerCase()}.`),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
    },
  });
}

/** Available donors with exactly the requested blood type — the backend's matching rule. */
export function useMatchCandidates(request: BloodRequest | null, location?: string) {
  const params: DonorSearchParams = {
    bloodType: request?.bloodType,
    isAvailable: true,
    location: location || undefined,
    limit: 20,
    sortBy: "lastDonationDate",
    sortOrder: "asc",
  };
  return useQuery({
    queryKey: queryKeys.donors(params),
    queryFn: () => donorService.search(params),
    enabled: !!request,
    placeholderData: keepPreviousData,
  });
}

export function useRequestMatches(requestId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.matches.forRequest(requestId ?? ""),
    queryFn: () => matchService.listForRequest(requestId!),
    enabled: !!requestId,
  });
}

export function useCreateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMatchInput) => matchService.create(input),
    onSuccess: (match) => {
      toast.success(`${match.donor?.name ?? "Donor"} matched. They'll be asked to accept.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
      queryClient.invalidateQueries({ queryKey: ["donors"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
    },
  });
}
