import "server-only";

import { QueryClient } from "@tanstack/react-query";
import { cache } from "react";

// One QueryClient per server request, shared by every Server Component
// that prefetches during that render.
export const getServerQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: { queries: { staleTime: 30 * 1000 } },
    }),
);
