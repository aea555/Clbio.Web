import { useEffect, useRef } from "react";
import { useSocket } from "@/providers/socket-provider";

export function useSocketEventListener(
  eventName: string,
  handler: (...args: any[]) => void
) {
  const { connection } = useSocket();
  const savedHandler = useRef(handler);

  // Keep the handler fresh without restarting the effect
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!connection) return;

    const eventListener = (...args: any[]) => savedHandler.current(...args);
    
    connection.on(eventName, eventListener);

    return () => {
      connection.off(eventName, eventListener);
    };
  }, [connection, eventName]);
}