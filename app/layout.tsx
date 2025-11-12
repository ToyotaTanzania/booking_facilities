import "@/styles/globals.css";

import { Red_Hat_Text } from "next/font/google"
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import Providers from "./providers";
import { cn } from "@/lib/utils";
import { env } from "@/env";

export const metadata: Metadata = {
  title: {
    template: "%s | Meeting Hub",
    default: "Meeting Hub - Karimjee",
  },
  description: "",
  metadataBase: new URL(env.NEXT_PUBLIC_BASE_URL),
}

const redHatFont = Red_Hat_Text({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-redhat",
})

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en"
    className={cn(
      "font-sans",
      "bg-background text-foreground antialiased overscroll-none",
      redHatFont.variable
    )}>
      <body>
        <TRPCReactProvider>
          <Providers> { children } </Providers>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
