import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  createDummyRounds,
  createRandomRounds,
  GameRound,
  GameSession,
  GameSessionOptions,
  gameSessions,
  GameSessionStatus,
  GameSessionType,
  Landmark,
  Player,
} from "@/utils/game";
import { appwriteConfig, isDevelopment } from "../../../utils/constants";
import { getAdminServices } from "../../../lib/appwrite/server";
import { ID, Query } from "node-appwrite";
import { option } from "motion/react-client";

interface GameSetting {
  playerIds: string[];
  type: GameSessionType;
  options?: Partial<GameSessionOptions>;
}

const defaultGameSessionOptions: GameSessionOptions = {
  timePerRound: 30000,
  maxHearts: 5,
  totalRounds: 5,
  allowRepeats: true,
};

/* Create a game session*/
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameSetting } = body;

    if (!gameSetting) {
      return NextResponse.json(
        { error: "Missing gameSetting" },
        { status: 400 }
      );
    }

    const { type: gameType, playerIds, options } = gameSetting as GameSetting;

    if (!Array.isArray(playerIds) || playerIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid or missing playerIds" },
        { status: 400 }
      );
    }
    if (gameType != GameSessionType.SINGLE) {
      return NextResponse.json(
        {
          error:
            "Failed to create a session. ${gameType} mode is not available yet.",
        },
        { status: 400 }
      );
    }

    const { tables } = await getAdminServices();

    // TODO!: if multiplayer this needs to change!
    const playerResult = await tables.listRows({
      databaseId: appwriteConfig.database.main.id,
      tableId: appwriteConfig.database.main.tables.player.id,
      queries: [
        Query.equal("$id", playerIds[0]),
        Query.limit(1),
        Query.select(["*", "gameSession.*", "gameSession.rounds.*"]),
      ],
    });

    if (playerResult.total === 0) {
      return NextResponse.json(
        {
          error: "Unable to find player. Please go back to menu.",
        },
        { status: 404 }
      );
    }

    const player = playerResult.rows[0];

    console.log(player);

    if (
      player.gameSession &&
      player.gameSession.status != GameSessionStatus.ENDED
    ) {
      const session = player.gameSession;
      return NextResponse.json({
        id: session.$id,
        type: session.type,
        status: session.status,
        hearts: session.hearts,
        maxHearts: session.maxHearts,
        timePerRound: session.timePerRound,
        currentRound: session.currentRound,
        rounds: session.rounds.map((round: any) => ({
          landmark: round.landmark,
          score: round.score,
          accuracy: round.accuracy,
          startedAt: round.startedAt,
          endedAt: round.endedAt,
        })),
        players: playerIds,
      });
    }

    if (
      player.gameSession &&
      player.gameSession.status === GameSessionStatus.ENDED
    ) {
      try {
        await tables.deleteRow({
          databaseId: appwriteConfig.database.main.id,
          tableId: appwriteConfig.database.main.tables.gameSession.id,
          rowId: player.gameSession.$id,
        });

        // Unlink it from the player (set to null)
        await tables.updateRow({
          databaseId: appwriteConfig.database.main.id,
          tableId: appwriteConfig.database.main.tables.player.id,
          rowId: player.$id,
          data: { gameSession: null },
        });
      } catch (err) {
        console.error("Failed to delete ended game session:", err);
      }
    }

    const sessionOptions: GameSessionOptions = {
      ...defaultGameSessionOptions,
      ...options,
    };

    // TODO: populate the rounds

    const session: GameSession = {
      options: sessionOptions,
      createdAt: new Date().toISOString(),
      type: gameType,
      status: GameSessionStatus.ACTIVE,
      id: randomUUID(),
      players: [],
      rounds: createDummyRounds(playerIds),
      hearts: sessionOptions.maxHearts,
      score: 0,
      currentRound: 0,
      endedAt: null,
    };

    const rounds = await createRandomRounds(playerIds, {
      totalRounds: sessionOptions.totalRounds,
      allowRepeats: sessionOptions.allowRepeats,
    });

    const payload = {
      createdAt: "",
      rowId: "",
      data: {
        type: session.type,
        status: session.status,
        hearts: session.hearts,
        maxHearts: session.options.maxHearts,
        timePerRound: session.options.timePerRound,
        currentRound: session.currentRound,
        rounds: rounds,
        player: playerIds[0],
      },
    };

    try {
      const result = await tables.createRow({
        databaseId: appwriteConfig.database.main.id,
        tableId: appwriteConfig.database.main.tables.gameSession.id,
        rowId: ID.unique(),
        data: payload.data,
      });

      // relink to update row
      await tables.updateRow({
        databaseId: appwriteConfig.database.main.id,
        tableId: appwriteConfig.database.main.tables.player.id,
        rowId: player.$id,
        data: { gameSession: result.$id },
      });

      payload.createdAt = result.$createdAt;
      payload.rowId = result.$id;
    } catch (err: any) {
      console.error("Appwrite session creation failed:", err);
      throw new Error("Failed to save session in database.");
    }

    return NextResponse.json({
      id: payload.rowId,
      createdAt: payload.createdAt,
      ...payload.data,
    });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to start a game session" },
      { status: error?.status || error?.code || 500 }
    );
  }
}
