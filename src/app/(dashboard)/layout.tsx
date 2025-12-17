import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import SocketProvider from "@/providers/socket-provider"; 
import { SessionManager } from "@/components/auth/session-manager";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <SessionManager />
      <div className="flex h-screen w-full font-sans bg-[#f8fafb] dark:bg-[#111921] text-[#0e141b] dark:text-[#e8edf3]">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#111921] overflow-hidden">
          <Header />
          {/* Scrollable Canvas */}
          <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafb]/50 dark:bg-[#111921]/50">
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SocketProvider>
  );
}