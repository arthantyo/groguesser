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

          // SECURITY: Clear game session from localStorage
          localStorage.removeItem("game-store");
        },
        login: async (email, password) => {
          try {
            const form = new FormData();
            form.append("email", email);
            form.append("password", password);

            const res = await fetch("/api/auth/login", {
              method: "POST",
              body: form,
            });

            const data = await res.json();

            if (!res.ok) {
              console.error("Login failed:", data);
              throw new Error(data.error || `Login failed (${res.status})`);
            }

            console.log("Login successful:", data);

            set((state) => ({
              profile: {
                ...state.profile, // keep existing nested fields
                id: data.userId,
                playerId: data.playerId,
              },
            }));
          } catch (error) {
            console.error("Login error in store:", error);
            throw error;
          }
        },
        register: async (username, email, password) => {
          try {
            const form = new FormData();
            form.append("username", username);
            form.append("email", email);
            form.append("password", password);

            const res = await fetch("/api/auth/register", {
              method: "POST",
              body: form,
            });

            const data = await res.json();

            if (!res.ok) {
              console.error("Registration failed:", data);
              throw new Error(data.error || "Registration failed");
            }

            console.log("Registration successful:", data);

            set((state) => ({
              profile: {
                id: data.userId,
                playerId: data.playerId,
                username,
              },
            }));
          } catch (error) {
            console.error("Registration error in store:", error);
            throw error;
          }
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
    },
  ),
);
export const useAuthStoreMethods = (): AuthStateMethods =>
  useAuthStore((state) => state.methods);

export const useAuthStoreProfile = (): Profile | null =>
  useAuthStore((state) => state.profile);
