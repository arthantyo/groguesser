import { NextResponse } from "next/server";
import { getAdminServices } from "../../../../../../lib/appwrite/server";
import { Query } from "node-appwrite";
import { appwriteConfig } from "../../../../../../utils/constants";
import { GameSessionStatus } from "../../../../../../utils/game";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; roundId: string }> }
) {
  try {
    const { id, roundId } = await params;

    if (!id || !roundId) {
      return NextResponse.json(
        { error: "Missing sessionId or roundId" },
        { status: 400 }
      );
    }

    const { tables } = await getAdminServices();

    const sessionResult = await tables.listRows({
      databaseId: appwriteConfig.database.main.id,
      tableId: appwriteConfig.database.main.tables.gameSession.id,
      queries: [Query.equal("$id", id), Query.select(["*", "rounds.*"])],
    });

    if (sessionResult.total === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const session = sessionResult.rows[0];

    if (session.status !== "ACTIVE") {
      return NextResponse.json({ error: "Session has ended" }, { status: 400 });
    }

    if (
      session.currentRound < 0 ||
      session.currentRound >= session.rounds.length
    ) {
      return NextResponse.json(
        { error: "Invalid current round index" },
        { status: 400 }
      );
    }

    const currentRound = session.rounds[session.currentRound];

    if (!currentRound.startedAt) {
      return NextResponse.json(
        { error: "Round has not started yet" },
        { status: 400 }
      );
    }

    const landmarkResult = await tables.listRows({
      databaseId: appwriteConfig.database.main.id,
      tableId: appwriteConfig.database.main.tables.landmark.id,
      queries: [Query.equal("$id", currentRound.landmark)],
    });

    if (landmarkResult.total === 0) {
      return NextResponse.json(
        { error: "Landmark not found" },
        { status: 404 }
      );
    }

    const landmark = landmarkResult.rows[0];

    const currentTime = Date.now();
    const roundStartTime = new Date(currentRound.startedAt).getTime();
    const roundEndTime = roundStartTime + session.timePerRound;

    if (currentTime < roundEndTime) {
      return NextResponse.json(
        { error: "Round time is still ongoing" },
        { status: 400 }
      );
    }

    const timeEndedAt = new Date().toISOString();
    await tables.updateRow({
      databaseId: appwriteConfig.database.main.id,
      tableId: appwriteConfig.database.main.tables.round.id,
      rowId: roundId,
      data: {
        endedAt: timeEndedAt,
      },
    });

    const currentRoundIndex = session.rounds.indexOf(currentRound.id);
    const nextRoundIndex =
      currentRoundIndex + 1 < session.rounds.length
        ? currentRoundIndex + 1
        : null;

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
      endedAt: timeEndedAt,
      roundId: currentRound.id,
      landmark: {
        id: landmark.$id,
        label: landmark.label,
        longitude: landmark.longitude,
        latitude: landmark.latitude,
        imageUrl: landmark.image,
      },
      sessionEnded: isLastRound,
      nextRoundIndex,
    });
  } catch (error) {
    console.error("Error fetching current round:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
