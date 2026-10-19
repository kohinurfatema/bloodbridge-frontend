"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/lib/query-keys";
import { type AdminUserParams, adminService } from "@/services/admin.service";
import type { AdminUserRow, PaginationMeta } from "@/types";

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
