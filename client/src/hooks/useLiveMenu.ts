import { useEffect } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "@/lib/apiConfig";

/**
 * Hook to listen for real-time menu updates from the server.
 * @param onUpdate Function to call when the menu is updated.
 */
export function useLiveMenu(onUpdate: () => void) {
  useEffect(() => {
    const socket = io(API_BASE_URL);
    
    socket.on("menu:update", () => {
      onUpdate();
    });

    return () => {
      socket.disconnect();
    };
  }, [onUpdate]);
}
