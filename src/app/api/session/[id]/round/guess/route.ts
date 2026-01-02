import { NextResponse } from "next/server";
import {
  calculateDistanceScore,
  GameLocation,
  gameSessions,
  GameSessionStatus,
  getDistanceMeters,
} from "@/utils/game";
import { Query } from "node-appwrite";
import { getAdminServices } from "../../../../../../lib/appwrite/server";
import { appwriteConfig } from "../../../../../../utils/constants";

/* Send the guess of current round */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { longitude, latitude } = body;

    if (longitude == null || latitude == null) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const { tables } = await getAdminServices();

    const session = await tables.getRow({
      databaseId: appwriteConfig.database.main.id,
      tableId: appwriteConfig.database.main.tables.gameSession.id,
      rowId: id,
      queries: [Query.select(["*", "rounds.*"])],
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status !== GameSessionStatus.ACTIVE) {
      return NextResponse.json(
        { error: "Session already ended" },
        { status: 400 }
      );
    }

    const round = session.rounds[session.currentRound];

    const landmark = await tables.getRow({
      databaseId: appwriteConfig.database.main.id,
      tableId: appwriteConfig.database.main.tables.landmark.id,
      rowId: round.landmark,
    });

    if (!landmark) {
      return NextResponse.json(
        { error: "Landmark not found" },
        { status: 404 }
      );
    }

    const guessLocation: GameLocation = { longitude, latitude };
    const landmarkLocation: GameLocation = {
      longitude: landmark.longitude,
      latitude: landmark.latitude,
    };

    const distanceDiff = getDistanceMeters(landmarkLocation, guessLocation);
    const score = calculateDistanceScore(landmarkLocation, guessLocation);

    const decayConstant = 200;
    const acc = 100 * Math.exp(-distanceDiff / decayConstant);

    round.endedAt = new Date().toISOString();
    round.guessLatitude = latitude;
    round.guessLongitude = longitude;
    round.score = score;
    round.accuracy = Math.max(0, Math.min(100, acc));

    await tables.updateRow({
      databaseId: appwriteConfig.database.main.id,
      tableId: appwriteConfig.database.main.tables.round.id,
      rowId: round.$id,
      data: {
        endedAt: round.endedAt,
        guessLongitude: round.guessLongitude,
        guessLatitude: round.guessLatitude,
        accuracy: round.accuracy,
        score,
      },
    });

    const isLastRound = session.currentRound == session.rounds.length - 1;

    if (!isLastRound) {
      console.log("update");
      await tables.updateRow({
        databaseId: appwriteConfig.database.main.id,
        tableId: appwriteConfig.database.main.tables.gameSession.id,
        rowId: session.$id,
        data: { currentRound: session.currentRound + 1 },
      });
    } else {
      await tables.updateRow({
        databaseId: appwriteConfig.database.main.id,
        tableId: appwriteConfig.database.main.tables.gameSession.id,
        rowId: session.$id,
        data: { status: GameSessionStatus.ENDED },
      });
    }

    return NextResponse.json({
      data: {
        endedAt: round.endedAt,
        accuracy: acc,
        distanceFromTarget: distanceDiff,
        scoreReceived: score,
        landmark: {
          id: landmark.$id,
          label: landmark.label,
          longitude: landmark.longitude,
          latitude: landmark.latitude,
          imageUrl: landmark.imageUrl,
        },
        nextRoundIndex: !isLastRound ? session.currentRound + 1 : null,
        sessionEnded: isLastRound,
      },
    });
  } catch (error: any) {
    console.error("Error submitting guess:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
