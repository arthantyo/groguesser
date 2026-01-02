import { create } from "zustand";
import {
  GameSession,
  GameSessionType,
  Player,
  GameRound,
  GameSessionOptions,
  GameLocation,
  GameSessionStatus,
} from "../utils/game";
import { persist } from "zustand/middleware";

interface GameStateMethods {
  setSession: (session: GameSession) => void;
  createSession: (payload: {
    gameOptions?: GameSessionOptions;
    playerIds: string[];
  }) => Promise<void>;
  endSession: () => void;
  // nextRound: () => void;
  fetchCurrentRound: () => void;
  updateCurrentRound: (roundData: Partial<GameRound>) => void;
  guess: (payload: { guess: GameLocation }) => Promise<any>;
  timeout: () => Promise<any>;
}
interface GameState {
  currentRoundData: {
    id: string;
    duration: number;
    imageUrl: string;
    label: string;
  } | null;
  session: GameSession | null;
  loading: boolean;
  methods: GameStateMethods;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentRoundData: null,
      loading: false,
      session: null,
      methods: {
        endSession: async () => {
          const session = get().session;

          if (!session) {
            console.warn("No active session to delete.");
            return;
          }

          try {
            const res = await fetch(`/api/session/${session.id}/end`, {
              method: "DELETE",
            });

            if (!res.ok) {
              throw new Error(`Failed to delete session: ${res.status}`);
            }
          } catch (err) {
            console.error("[❌] Failed to end session:", err);
          }

          set({
            session: null,
            currentRoundData: null,
            loading: false,
          });
        },
        setSession: (session) => set({ session }),
        createSession: async ({ gameOptions, playerIds }) => {
          try {
            const res = await fetch("/api/session", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                gameSetting: {
                  options: gameOptions,
                  playerIds: playerIds,
                  type: GameSessionType.SINGLE,
                },
              }),
              cache: "no-store",
            });

            if (!res.ok) {
              throw new Error(`Failed to create session: ${res.status}`);
            }

            const data: GameSession = await res.json();

            set({ session: data });
          } catch (error) {
            console.error("[❌] createSession failed:", error);
          }
        },

        timeout: async () => {
          const currentRoundData = get().currentRoundData;
          const session = get().session;
          if (!session || !currentRoundData) return;

          try {
            const result = await fetch(
              `/api/session/${session.id}/timeout/${currentRoundData.id}`
            );
            if (!result.ok) throw new Error("Failed to fetch round");

            const data = await result.json();

            set((state) => {
              if (!state.session) return state;

              return {
                session: {
                  ...state.session!,
                  currentRound:
                    data.nextRoundIndex ?? state.session.currentRound,
                  status: data.sessionEnded
                    ? GameSessionStatus.ENDED
                    : state.session!.status,
                },
              };
            });

            return data;
          } catch (error) {
            console.error("[❌] Timeout failed:", error);
            throw error;
          }
        },
        guess: async ({ guess }) => {
          const session = get().session;
          if (!session) return;

          const currentRoundId = session.rounds[session.currentRound];
          if (!currentRoundId) {
            console.warn("No current round found");
            return;
          }

          try {
            const res = await fetch(`/api/session/${session.id}/round/guess`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                roundId: currentRoundId,
                longitude: guess.longitude,
                latitude: guess.latitude,
              }),
            });

            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err.error || `Guess failed (${res.status})`);
            }

            const data = await res.json();

            set((state) => {
              if (!state.session) return state;

              const updatedRounds = [...state.session.rounds];

              // Update current round’s details (if it exists)
              const roundToUpdate = updatedRounds[state.session.currentRound];
              if (roundToUpdate) {
                updatedRounds[state.session.currentRound] = {
                  ...roundToUpdate,
                  score: data.data.scoreReceived,
                  accuracy: data.data.accuracy,
                  endedAt: data.data.endedAt,
                };
              }

              return {
                session: {
                  ...state.session!,
                  rounds: updatedRounds,
                  currentRound:
                    data.data.nextRoundIndex ?? state.session.currentRound,
                  status: data.data.sessionEnded
                    ? GameSessionStatus.ENDED
                    : state.session!.status,
                },
              };
            });

            return data.data; // score & next round info
          } catch (err: any) {
            console.error("[❌] Guess failed:", err);
            throw err;
          }
        },
        updateCurrentRound: (roundData: Partial<GameRound>) => {
          set((state) => {
            if (!state.session) return state;

            const updatedRounds = [...state.session.rounds];
            updatedRounds[state.session.currentRound] = {
              ...updatedRounds[state.session.currentRound],
              ...roundData,
            };

            return {
              session: {
                ...state.session,
                rounds: updatedRounds,
              },
            };
          });
        },
        fetchCurrentRound: async () => {
          const session = get().session;
          if (!session) return;

          set({ loading: true });

          try {
            const res = await fetch(`/api/session/${session.id}/round`);
            if (!res.ok) throw new Error("Failed to fetch round");

            const data = await res.json();

            const roundData = {
              id: data.roundId,
              duration: data.duration,
              imageUrl: data.landmark.imageUrl,
              label: data.landmark.label,
            };

            set((state) => {
              if (!state.session) return { currentRoundData: roundData };

              const updatedRounds = [...state.session.rounds];

              const roundToUpdate = updatedRounds[state.session.currentRound];
              if (roundToUpdate) {
                updatedRounds[state.session.currentRound] = {
                  ...roundToUpdate,
                  startedAt: data.startedAt,
                };
              }

              return {
                currentRoundData: roundData,
                session: {
                  ...state.session,
                  rounds: updatedRounds,
                  maxHearts: data.session.maxHearts,
                  timePerRound: data.session.timePerRound,
                  currentRound: data.session.currentRound,
                  id: data.session.id,
                },
              };
            });

            return;
          } catch (err) {
            console.error("Error loading current round:", err);
            return null;
          } finally {
            set({ loading: false });
          }
        },

        // nextRound: () => {
        //   const session = get().session;
        //   if (!session) return;

        //   const nextIndex = session.currentRound + 1;

        //   if (nextIndex >= session.rounds.length) {
        //     set({
        //       session: {
        //         ...session,
        //         currentRound: session.currentRound,
        //         status: GameSessionStatus.ENDED,
        //       },
        //     });
        //   } else {
        //     set({
        //       session: {
        //         ...session,
        //         currentRound: nextIndex,
        //         // Optionally reset round-specific state here
        //         // e.g., reset guesses if you store them per session
        //       },
        //     });
        //   }
        // },
      },
    }),
    {
      name: "game-store",
      partialize: (state) => ({ session: state.session }),
    }
  )
);

export const useGameStoreCurrentRoundData = () =>
  useGameStore((state) => state.currentRoundData);
export const useGameStoreLoading = () => useGameStore((state) => state.loading);

export const useGameStoreMethods = (): GameStateMethods =>
  useGameStore((state) => state.methods);

export const useGameStoreSession = (): GameSession | null =>
  useGameStore((state) => state.session);
