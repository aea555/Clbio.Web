// import { Sidebar } from "@/components/layout/sidebar";
import SocketProvider from "@/providers/socket-provider"; 

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <div className="flex h-screen w-full">
        {/* <Sidebar /> */}
        <main className="flex-1 overflow-auto bg-gray-100">
          {children}
        </main>
      </div>
    </SocketProvider>
  );
}