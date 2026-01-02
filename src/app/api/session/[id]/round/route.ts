import { NextRequest, NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { getAdminServices } from "../../../../../lib/appwrite/server";
import { appwriteConfig } from "../../../../../utils/constants";
import { GameSessionStatus } from "../../../../../utils/game";

// TODO: get a current round

// TODO: implementing user check
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    if (!id) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const { tables } = await getAdminServices();

    // Fetch session from Appwrite
    const sessionResult = await tables.listRows({
      databaseId: appwriteConfig.database.main.id,
      tableId: appwriteConfig.database.main.tables.gameSession.id,
      queries: [
        Query.equal("$id", id),
        Query.limit(1),
        Query.select(["*", "rounds.*"]),
      ],
    });

    if (sessionResult.total === 0) {
      return NextResponse.json(
        {
          error: "Unable to find session. Please go back to menu.",
        },
        { status: 404 }
      );
    }

    const session = sessionResult.rows[0];

    if (session.status == GameSessionStatus.ENDED) {
      return NextResponse.json(
        {
          error: "Game has ended!",
        },
        { status: 404 }
      );
    }

    const currentRoundIndex = session.currentRound ?? 0;

    if (currentRoundIndex > 4) {
      return NextResponse.json(
        {
          error: "Game has ended!",
        },
        { status: 404 }
      );
    }

    const round = session.rounds?.[currentRoundIndex];

    if (!round) {
      return NextResponse.json(
        { error: "Current round not found" },
        { status: 404 }
      );
    }

    let landmarkData = null;
    if (round.landmark) {
      const landmarkResult = await tables.listRows({
        databaseId: appwriteConfig.database.main.id,
        tableId: appwriteConfig.database.main.tables.landmark.id,
        queries: [Query.equal("$id", round.landmark)],
      });

      if (landmarkResult.total > 0) {
        const lm = landmarkResult.rows[0];
        landmarkData = {
          id: lm.id,
          label: lm.label,
          location: lm.location,
          imageUrl: lm.image,
        };
      }
    }

    if (!round.startedAt) {
      round.startedAt = new Date().toISOString();

      await tables.updateRow({
        databaseId: appwriteConfig.database.main.id,
        tableId: appwriteConfig.database.main.tables.round.id,
        rowId: round.$id,
        data: { startedAt: round.startedAt },
      });
    }

    return NextResponse.json({
      session: {
        timePerRound: session.timePerRound,
        currentRound: session.currentRound,
        hearts: session.hearts,
        id: session.$id,
        session: session.maxHearts,
      },
      startedAt: round.startedAt,
      duration: session.timePerRound,
      roundId: round.$id,
      landmark: landmarkData,
      score: round.score,
    });
  } catch (error) {
    console.error("Error getting current round:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
