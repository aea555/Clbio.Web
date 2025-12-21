import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import SocketProvider from "@/providers/socket-provider";
import { SessionManager } from "@/components/auth/session-manager";
import { PermissionsProvider } from "@/providers/permission-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <SessionManager />
      <div className="flex h-screen w-full font-sans bg-background text-foreground transition-colors duration-300">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden border-l border-border-base">
          <Header />
          {/* Scrollable Canvas */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <PermissionsProvider>
              <div className="w-full flex-1 mx-auto flex flex-col gap-8">
                {children}
              </div>
            </PermissionsProvider>
          </div>
        </main>
      </div>
    </SocketProvider>
  );
}