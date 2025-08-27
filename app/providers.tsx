import { Toaster } from "sonner";
import { type ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <Toaster position="top-right" richColors />
      <NuqsAdapter>{children}</NuqsAdapter>
    </SessionProvider>
  );
}
