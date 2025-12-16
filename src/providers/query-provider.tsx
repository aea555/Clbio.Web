"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is fresh for 1 minute (prevents excessive re-fetching)
            staleTime: 60 * 1000, 
            // Retry failed requests once before showing error
            retry: 1,
            // Don't refetch on window focus 
            refetchOnWindowFocus: false, 
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}