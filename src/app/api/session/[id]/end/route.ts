import { NextRequest, NextResponse } from "next/server";
import { getAdminServices } from "../../../../../lib/appwrite/server";
import { createSessionClient } from "../../../../../lib/appwrite/client";
import { appwriteConfig } from "../../../../../utils/constants";
import { Query } from "node-appwrite";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // SECURITY: Verify authenticated user owns this session
    const { account } = await createSessionClient();
    const user = await account.get();

    const { tables } = await getAdminServices();

    const gameSession = await tables.getRow({
      databaseId: appwriteConfig.database.main.id,
      tableId: appwriteConfig.database.main.tables.gameSession.id,
      rowId: id,
      queries: [Query.select(["*", "rounds.*", "player.*"])],
    });

    if (!gameSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // SECURITY: Verify session belongs to authenticated user
    const playerId = gameSession.player.$id;
    if (!playerId) {
      return NextResponse.json(
        { error: "Invalid session: no player associated" },
        { status: 400 },
      );
    }

    const player = await tables.getRow({
      databaseId: appwriteConfig.database.main.id,
      tableId: appwriteConfig.database.main.tables.player.id,
      rowId: playerId,
    });

    if (player.userId !== user.$id) {
      return NextResponse.json(
        { error: "Unauthorized: This session does not belong to you" },
        { status: 403 },
      );
    }

    const totalScore = gameSession.rounds.reduce(
      (sum: any, round: { score: any }) => {
        return sum + (round.score || 0);
      },
      0,
    );

    // Update player score
    const updatedScore = (player.score || 0) + totalScore;
    await tables.updateRow({
      databaseId: appwriteConfig.database.main.id,
      tableId: appwriteConfig.database.main.tables.player.id,
      rowId: playerId,
      data: { score: updatedScore, gameSession: null },
    });

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
      { status: error?.status || error?.code || 500 },
    );
  }
}
