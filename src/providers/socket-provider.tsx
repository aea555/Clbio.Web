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
            if (!response.ok) throw new Error("Could not fetch token");
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
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          if (retryContext.previousRetryCount < 3) return 2000;
          if (retryContext.previousRetryCount < 10) return 5000;
          return 30000;
        }
      })
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    const startConnection = async () => {
      try {
        await newConnection.start();
        console.log("🟢 SignalR Connected: ", newConnection.connectionId);
        setIsConnected(true);
      } catch (err) {
        const error = err as Error;
        if (error.name && error.name === 'AbortError' || error.message.includes("stop() was called")) {
          return;
        }
        console.error("🔴 SignalR Connection Error:", err);
        setTimeout(startConnection, 5000);
      }
    };

    startConnection();

    newConnection.onreconnecting(() => {
      console.warn("🟡 SignalR Reconnecting...");
      setIsConnected(false);
    });

    newConnection.onreconnected((connectionId) => {
      console.log("🟢 SignalR Reconnected. New ID:", connectionId);
      setIsConnected(true);
    });

    newConnection.onclose(() => {
      console.error("🔴 SignalR Connection Closed");
      setIsConnected(false);
    });

    setConnection(newConnection);

    return () => {
      if (newConnection.state !== signalR.HubConnectionState.Disconnected) {
        newConnection.stop();
      }
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ connection, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}