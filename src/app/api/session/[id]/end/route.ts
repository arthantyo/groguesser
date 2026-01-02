import { NextRequest, NextResponse } from "next/server";
import { getAdminServices } from "../../../../../lib/appwrite/server";
import { appwriteConfig } from "../../../../../utils/constants";
import { Query } from "node-appwrite";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const { tables } = await getAdminServices();

    const gameSession = await tables.getRow({
      databaseId: appwriteConfig.database.main.id,
      tableId: appwriteConfig.database.main.tables.gameSession.id,
      rowId: id,
      queries: [Query.select(["*", "rounds.*"])],
    });

    if (!gameSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const totalScore = gameSession.rounds.reduce(
      (sum: any, round: { score: any }) => {
        return sum + (round.score || 0);
      },
      0
    );

    const playerId = gameSession.player; // adjust key if named differently
    if (!playerId) {
      console.warn("No playerId in session, skipping score transfer");
    } else {
      const player = await tables.getRow({
        databaseId: appwriteConfig.database.main.id,
        tableId: appwriteConfig.database.main.tables.player.id,
        rowId: playerId,
      });

      const updatedScore = (player.score || 0) + totalScore;
      await tables.updateRow({
        databaseId: appwriteConfig.database.main.id,
        tableId: appwriteConfig.database.main.tables.player.id,
        rowId: playerId,
        data: { score: updatedScore },
      });
    }

    await tables.deleteRow({
      databaseId: appwriteConfig.database.main.id,
      tableId: appwriteConfig.database.main.tables.gameSession.id,
      rowId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to terminate a game session" },
      { status: error?.status || error?.code || 500 }
    );
  }
}
