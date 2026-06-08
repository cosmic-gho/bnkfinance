import { UserLayout } from "@/components/user-layout";

export default function WireTransferLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserLayout>{children}</UserLayout>;
}

