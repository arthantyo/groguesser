import { NextResponse } from "next/server";
import { getAdminServices } from "@/lib/appwrite/server";
import { appwriteConfig } from "@/utils/constants";
import { Query } from "node-appwrite";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const { tables } = await getAdminServices();

    // Fetch players sorted by score in descending order
    const result = await tables.listRows({
      databaseId: appwriteConfig.database.main.id,
      tableId: appwriteConfig.database.main.tables.player.id,
      queries: [Query.orderDesc("score"), Query.limit(limit)],
    });

    const leaderboard = result.rows.map((player: any, index: number) => ({
      id: player.id || player.$id,
      name: player.username,
      score: player.score || 0,
      rank: index + 1,
    }));

    return NextResponse.json({
      data: leaderboard,
      total: result.total,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
