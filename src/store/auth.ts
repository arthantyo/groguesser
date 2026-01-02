import { create } from "zustand";
import { isDevelopment } from "../utils/constants";
import { persist } from "zustand/middleware";

interface Profile {
  id: string;
  playerId: string;
  username?: string;
}

interface AuthStateMethods {
  logout: () => void;
  getProfile: () => void;
  login: (username: string, password: string) => void;
  register: (username: string, email: string, password: string) => void;
  setUsername: (username: string) => void;
}

interface AuthState {
  profile: Profile | null;
  methods: AuthStateMethods;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      profile: null,
      methods: {
        logout: async () => {
          const res = await fetch("/api/auth/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!res.ok) {
            throw new Error(`Logout failed (${res.status})`);
          }

          set({ profile: null });
        },
        login: async (email, password) => {
          const form = new FormData();
          form.append("email", email);
          form.append("password", password);

          const res = await fetch("/api/auth/login", {
            method: "POST",
            body: form,
          });

          if (!res.ok) {
            throw new Error(`Login failed (${res.status})`);
          }

          const data = await res.json();

          set((state) => ({
            profile: {
              ...state.profile, // keep existing nested fields
              id: data.userId,
              playerId: data.playerId,
            },
          }));
        },
        register: async (username, email, password) => {
          const form = new FormData();
          form.append("username", username);
          form.append("email", email);
          form.append("password", password);

          const res = await fetch("/api/auth/register", {
            method: "POST",
            body: form,
          });

          if (!res.ok) {
            throw new Error(`Registration failed`);
          }

          const data = await res.json();

          set((state) => ({
            profile: {
              id: data.userId,
              playerId: data.playerId,
              username,
            },
          }));
        },
        getProfile: async () => {
          const res = await fetch("/api/auth/profile", { cache: "no-store" });
          if (!res.ok) {
            console.warn("Failed to load profile, clearing session.");
            set({ profile: null });
            return;
          }

          const data = await res.json();
          set({
            profile: {
              id: data.userId,
              playerId: data.playerId,
            },
          });
        },
        setUsername: (username: string) => {
          set((state) => ({
            profile: state.profile
              ? { ...state.profile, username }
              : { id: "", playerId: "", username },
          }));
        },
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);
export const useAuthStoreMethods = (): AuthStateMethods =>
  useAuthStore((state) => state.methods);

export const useAuthStoreProfile = (): Profile | null =>
  useAuthStore((state) => state.profile);
