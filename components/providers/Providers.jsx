"use client";

import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: 1,
                        refetchOnWindowFocus: false,
                        staleTime: 1000 * 60 * 5, // 5 minutes
                    },
                },
            })
    );

    return (
        <KindeProvider>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </KindeProvider>
    );
}
