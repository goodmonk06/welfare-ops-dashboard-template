import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex">
      <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0">
        <Sidebar />
      </div>
      <main className="md:pl-72 flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
