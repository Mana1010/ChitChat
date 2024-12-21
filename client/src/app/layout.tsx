import type { Metadata } from "next";
import { DM_Sans, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import AuthProvider from "@/context/AuthProvider";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/api/uploadthing/core";

const inter = Poppins({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Chitchat",
  description: "A realtime chat application powered by Socket IO",
  keywords: [
    "chat application",
    "group chat",
    "private chat",
    "public chat",
    "real time",
    "mail",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            backgroundColor: "#ffff",
            border: "none",
            color: "#171717",
          },
        }}
      />

      <body className={inter.className}>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
