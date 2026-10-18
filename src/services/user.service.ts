import { api } from "@/lib/api/client";
import type { User } from "@/types";

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
}

export const userService = {
  getMe: () => api<User>("/users/me"),
  updateMe: (body: UpdateProfileInput) =>
    api<User>("/users/me", { method: "PATCH", body }),
};
