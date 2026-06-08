"use client";

import { UserLayout } from "@/components/user-layout";

export default function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return <UserLayout>{children}</UserLayout>;
}
