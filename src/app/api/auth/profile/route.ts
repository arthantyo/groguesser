import { NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { appwriteConfig } from "../../../../utils/constants";
import { getAdminServices } from "../../../../lib/appwrite/server";
import { createSessionClient } from "../../../../lib/appwrite/client";

export async function GET() {
  try {
    const { account } = await createSessionClient();
    const { tables } = await getAdminServices();

    const user = await account.get();

    const playerResult = await tables.listRows({
      databaseId: appwriteConfig.database.main.id,
      tableId: appwriteConfig.database.main.tables.player.id,
      queries: [
        Query.equal("userId", user.$id),
        Query.limit(1),
        Query.select(["$id"]),
      ],
    });

    if (playerResult.total < 1) {
      return NextResponse.json(
        { error: "This should not happen. Contact the developer." },
        { status: 400 }
      );
    }

    const player = playerResult.rows[0];

    return NextResponse.json({ userId: user.$id, playerId: player.$id });
  } catch (err: any) {
    console.error("Failed to fetch user profile:", err);
    return NextResponse.json(
      { error: "Unauthorized or session invalid" },
      { status: 401 }
    );
  }
}
