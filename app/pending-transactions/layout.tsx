import { UserLayout } from "@/components/user-layout";

export default function PendingTransactionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserLayout>{children}</UserLayout>;
}

