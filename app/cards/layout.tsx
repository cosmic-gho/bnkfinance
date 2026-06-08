import { UserSidebar } from "@/components/user-sidebar";

export default function CardsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <UserSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}

