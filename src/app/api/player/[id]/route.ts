import { NextResponse } from "next/server";
import { getAdminServices } from "@/lib/appwrite/server";
import { appwriteConfig } from "@/utils/constants";
import { Query } from "node-appwrite";
import { getLoggedInUser } from "../../../../lib/appwrite/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = (await params).id;

    if (!userId) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    const sessionUser = await getLoggedInUser();

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (sessionUser.$id !== userId) {
      return NextResponse.json(
        { error: "Forbidden: not allowed to view this profile" },
        { status: 403 }
      );
    }

    const { tables } = await getAdminServices();
    const result = await tables.listRows({
      databaseId: appwriteConfig.database.main.id,
      tableId: appwriteConfig.database.main.tables.player.id,
      queries: [Query.equal("userId", userId)],
    });

    if (result.total === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profile = result.rows[0];
    return NextResponse.json({
      data: {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        score: profile.score,
        rank: profile.rank,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
