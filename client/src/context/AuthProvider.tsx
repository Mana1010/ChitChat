"use client";
import { SessionProvider } from "next-auth/react";
import React from "react";
import { QueryClientProvider, QueryClient } from "react-query";

function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  );
}
export default AuthProvider;
