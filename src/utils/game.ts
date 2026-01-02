import { allLandmarksDummy } from "./dummy";
import { appwriteConfig, isDevelopment } from "./constants";
import { getAdminServices } from "../lib/appwrite/server";
import { ID, Query } from "node-appwrite";

// Types
export interface GameSession {
  id: string;
  status: GameSessionStatus;
  createdAt: string;
  hearts: number;
  endedAt: string | null;
  rounds: GameRound[];
  score: number;
  currentRound: number;
  players?: Player[];
  type: GameSessionType;
  options: GameSessionOptions;
}

export interface GameSessionOptions {
  timePerRound: number;
  maxHearts: number;
  totalRounds: number;

  /**
   * Whether previously solved landmarks can be included in new rounds.
   * - true → rounds can repeat solved landmarks
   * - false → only unsolved landmarks will be used
   * Default: false
   */
  allowRepeats?: boolean;
}

export interface Player {
  id: string;
  username: string;
  status: PlayerStatus;
  score: number;
  solvedLandmarks: Landmark[];
}

export interface GameRound {
  accuracy?: number;
  landmark: Landmark | string;
  guess?: GameLocation;
  score: number;
  roundWon?: boolean;
  startedAt?: string | null;
  endedAt?: string | null; // will be set when the round ends
}

export interface RoundAnswer {
  scoreReceived: number;
  distance: number;
  roundWon: boolean;
}

export interface Landmark {
  id: string;
  label: string;
  location: GameLocation;
  imageUrl: string;
}

export interface GameLocation {
  latitude: number;
  longitude: number;
}

export enum PlayerStatus {
  PLAYING = "PLAYING",
  IDLE = "IDLE",
}

export enum GameSessionStatus {
  ACTIVE = "ACTIVE",
  ENDED = "ENDED",
}

export enum GameSessionType {
  SINGLE = "SINGLE",
  PARTY = "PARTY",
}

export const gameSessions: GameSession[] = [];

// session
// export function createSession() {
//   const newGameSession = {
//     id: randomUUID(),
//     createdAt: Date.now().toString(),
//     players: [],
//     score: 0,
//     status: GameSessionStatus.ACTIVE,
//     rounds: [],
//     currentRound: 0,
//     type: GameSessionType.SINGLE,
//     endedAt: null,
//   };

//   gameSessions.push(newGameSession);
// }

export function endSession() {}

// round
export function createRound() {}

export function endRound() {}

export function nextRound() {}

export function guessRound() {}

export function showAnswer() {}

// Utility Functions

export function getRoundResult(landmarkId: string) {
  // TODO: should fetch landmark id and then get the answer then return
}

export function getRandomLandmark() {
  // ! ensure landmark is a place where user haven't had a success!
}

export async function createRandomRounds(
  playerIds: string[],
  options: Pick<GameSessionOptions, "totalRounds" | "allowRepeats"> = {
    totalRounds: 5,
    allowRepeats: true,
  }
): Promise<GameRound[]> {
  const { totalRounds, allowRepeats } = options;

  let landmarkData = [];

  const { tables } = await getAdminServices();

  const allLandmarks = await tables.listRows({
    databaseId: appwriteConfig.database.main.id,
    tableId: appwriteConfig.database.main.tables.landmark.id,
    queries: [Query.limit(25), Query.select(["$id"])],
  });

  landmarkData = allLandmarks.rows.map((row: any) => ({
    id: row.$id,
  }));

  let filteredLandmarks = landmarkData;

  if (!allowRepeats) {
    const playerRowsResult = await tables.listRows({
      databaseId: appwriteConfig.database.main.id,
      tableId: appwriteConfig.database.main.tables.player.id,
      queries: [Query.limit(1000)],
    });

    const solvedIdsSet = new Set<string>();
    playerRowsResult.rows.forEach((player: any) => {
      if (playerIds.includes(player.userId)) {
        (player.solvedLandmarks ?? []).forEach((lmId: string) =>
          solvedIdsSet.add(lmId)
        );
      }
    });

    filteredLandmarks = landmarkData.filter((lm) => !solvedIdsSet.has(lm.id));
  }

  const shuffled = [...filteredLandmarks].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, totalRounds);

  const rounds = selected.map((landmark) => ({
    landmark: landmark.id,
    score: 0,
    accuracy: 0,
    startedAt: null,
    endedAt: null,
  }));

  return rounds;
}

/**
 * Generate random dummy rounds using only landmark IDs
 * @param playerIds Array of player IDs (not used in dummy version)
 * @param options Only totalRounds and allowRepeats are needed
 */
export function createDummyRounds(
  playerIds: string[],
  options: Pick<GameSessionOptions, "totalRounds" | "allowRepeats"> = {
    totalRounds: 5,
    allowRepeats: true,
  }
): GameRound[] {
  const { totalRounds } = options;

  // Shuffle dummy landmarks
  const shuffled = [...allLandmarksDummy].sort(() => Math.random() - 0.5);

  // Pick the first N landmarks
  const selected: Landmark[] = shuffled.slice(0, totalRounds);

  // Build rounds with only landmark IDs
  const rounds: GameRound[] = selected.map((landmark) => ({
    id: ID.unique(),
    landmark: landmark, // store only the ID
    score: 0,
  }));

  return rounds;
}

export function createDummyPlayer(): Player {
  return {
    id: crypto.randomUUID(),
    username: "TestPlayer",
    status: PlayerStatus.IDLE, // or PlayerStatus.Idle, depending on your enum
    score: 0,
    solvedLandmarks: [],
  };
}

export async function createDummyGameSession(
  players: Player[]
): Promise<GameSession> {
  const playerIds = players.map((p) => p.id);
  const rounds = await createRandomRounds(playerIds);

  const session: GameSession = {
    options: {
      timePerRound: 30000,
      maxHearts: 5,
      totalRounds: 5,
    },
    createdAt: new Date().toISOString(),
    type: GameSessionType.SINGLE,
    endedAt: null,
    id: crypto.randomUUID(),
    players,
    rounds,
    hearts: 5,
    score: 0,
    currentRound: 0,
    status: GameSessionStatus.ACTIVE,
  };

  return session;
}

export function calculateDistanceScore(
  answer: GameLocation,
  guess: GameLocation
): number {
  const distance = getDistanceMeters(answer, guess);

  const maxScore = 1000;
  const maxDistance = 50;
  const minScore = 50;

  let score: number;

  if (distance <= maxDistance) {
    const t = distance / maxDistance;
    score = maxScore - (maxScore - minScore) * t; // linear interpolation
  } else {
    score = minScore * Math.exp(-((distance - maxDistance) / 500));
  }

  return Math.round(score);
}

export function getDistanceMeters(guess: GameLocation, target: GameLocation) {
  const R = 6371000;

  const lat1 = guess.latitude * (Math.PI / 180);
  const lon1 = guess.longitude * (Math.PI / 180);
  const lat2 = target.latitude * (Math.PI / 180);
  const lon2 = target.longitude * (Math.PI / 180);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const hav =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(hav));
}
