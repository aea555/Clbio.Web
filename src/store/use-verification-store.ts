import { create } from "zustand";

interface VerificationState {
  email: string | null;
  password: string | null; 
  
  // Actions
  setVerificationContext: (email: string, password?: string) => void;
  clearVerificationContext: () => void;
}

export const useVerificationStore = create<VerificationState>((set) => ({
  email: null,
  password: null,

  setVerificationContext: (email, password) => 
    set({ email, password: password || null }),
    
  clearVerificationContext: () => 
    set({ email: null, password: null }),
}));