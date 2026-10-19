"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { queryKeys } from "@/lib/query-keys";
import { type UpdateProfileInput, userService } from "@/services/user.service";
import { useAuthStore } from "@/store/auth-store";
import type { SessionUser } from "@/types";

export function useMe() {
  return useQuery({ queryKey: queryKeys.me, queryFn: userService.getMe });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => userService.updateMe(input),
    onSuccess: async (updated) => {
      queryClient.setQueryData(queryKeys.me, (old: object | undefined) => ({ ...old, ...updated }));
      // Refresh the session cookie so the server-rendered sidebar shows the new name.
      const res = await fetch("/api/auth/session", { method: "POST" });
      const json = (await res.json().catch(() => null)) as { data?: { user: SessionUser } } | null;
      if (json?.data?.user) setUser(json.data.user);
      router.refresh();
      toast.success("Profile updated.");
    },
    onError: () => {},
  });
}
