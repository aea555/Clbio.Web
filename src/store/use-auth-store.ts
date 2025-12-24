import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ReadUserDto } from "@/types/dtos";

/**
 * Allows both:
 *  - setUser(user)
 *  - setUser(prev => nextUser)
 */
type UserUpdater =
  | ReadUserDto
  | null
  | ((prev: ReadUserDto | null) => ReadUserDto | null);

interface AuthState {
  // --- State ---
  user: ReadUserDto | null;
  isAuthenticated: boolean;

  /**
   * Prevents SessionManager from overwriting
   * locally-mutated avatar state while uploads/deletes are in-flight
   */
  isAvatarUpdating: boolean;

  // --- Actions ---
  setUser: (updater: UserUpdater) => void;
  setAvatarUpdating: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // --- Initial State ---
      user: null,
      isAuthenticated: false,
      isAvatarUpdating: false,

      // --- Actions ---
      setUser: (updater) =>
        set((state) => {
          const nextUser =
            typeof updater === "function"
              ? updater(state.user)
              : updater;

          return {
            user: nextUser,
            isAuthenticated: !!nextUser,
          };
        }),

      setAvatarUpdating: (value) =>
        set({ isAvatarUpdating: value }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isAvatarUpdating: false,
        }),
    }),
    {
      name: "clbio-auth-storage",

      /**
       * Only persist what actually matters.
       * Prevents stale flags surviving refresh.
       */
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user ? {
          id: state.user.id,
          email: state.user.email,
          displayName: state.user.displayName,
          avatarUrl: state.user.avatarUrl,
        } : null,
      }),
    }
  )
);
