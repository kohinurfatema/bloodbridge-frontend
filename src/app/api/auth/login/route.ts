import { forwardAuth } from "@/lib/auth/forward-auth";

export function POST(req: Request) {
  return forwardAuth("login", req);
}
