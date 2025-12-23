"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as signalR from "@microsoft/signalr";
import { useAuthStore } from "@/store/use-auth-store";

interface SocketContextType {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  connection: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({ children }: { children: ReactNode }) {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const HUB_URL = `${process.env.NEXT_PUBLIC_API_ORIGIN}/hubs/app`;

  useEffect(() => {
    // Only connect if the user is authenticated
    if (!isAuthenticated) {
        if (connection) {
            connection.stop();
            setConnection(null);
            setIsConnected(false);
        }
        return;
    }


    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        // Fetch the token from our Next.js API route
        accessTokenFactory: async () => {
          try {
            const response = await fetch("/api/auth/token");
            const data = await response.json();
            return data.accessToken || "";
          } catch {
            return "";
          }
        },
        // Configure transport
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    newConnection.start()
      .then(() => {
        console.log("🟢 SignalR Connected");
        setIsConnected(true);
      })
      .catch((err) => console.error("🔴 SignalR Connection Error:", err));

    newConnection.onclose(() => setIsConnected(false));
    newConnection.onreconnecting(() => setIsConnected(false));
    newConnection.onreconnected(() => setIsConnected(true));

    setConnection(newConnection);

    return () => {
      newConnection.stop();
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ connection, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}