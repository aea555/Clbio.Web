import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ReadUserDto } from "@/types/dtos";

interface AuthState {
  user: ReadUserDto | null;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: ReadUserDto) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "clbio-auth-storage", // Key in localStorage
    }
  )
);