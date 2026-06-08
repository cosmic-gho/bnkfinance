"use client";

import { UserLayout } from "@/components/user-layout";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <UserLayout>{children}</UserLayout>;
}

