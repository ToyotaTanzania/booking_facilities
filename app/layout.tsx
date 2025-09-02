import "@/styles/globals.css";

import { Cairo, Lato } from "next/font/google"
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
  metadataBase: new URL(env.NEXT_PUBLIC_BASE_URL as string),
}

const latoFont = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-lato",
})
const cairoFont = Cairo({
  subsets: ["arabic"],
  weight: ["400", "700"],
  style: ["normal"],
  variable: "--font-cairo",
})

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" 
    className={cn(
      "[&:lang(en)]:font-lato [&:lang(ar)]:font-cairo", // Set font styles based on the language
      "bg-background text-foreground antialiased overscroll-none", // Set background, text, , anti-aliasing styles, and overscroll behavior
      latoFont.variable, // Include Lato font variable
      cairoFont.variable // Include Cairo font variable
    )}>
      <body>
        <TRPCReactProvider>
          <Providers> { children } </Providers>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
