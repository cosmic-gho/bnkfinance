import { UserLayout } from "@/components/user-layout";

export default function DepositLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserLayout>{children}</UserLayout>;
}

