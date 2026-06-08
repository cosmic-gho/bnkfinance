"use client";

import { Navigation } from "@/components/navigation";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {isDashboard ? (
        children
      ) : (
        <Navigation>{children}</Navigation>
      )}
    </ThemeProvider>
  );
}
