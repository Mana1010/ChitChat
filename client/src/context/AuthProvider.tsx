"use client";
import { SessionProvider } from "next-auth/react";
import React from "react";
// import QueryClientProvider from 'react'

function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
export default AuthProvider;
