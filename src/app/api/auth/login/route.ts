import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminServices } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import { appwriteConfig } from "../../../../utils/constants";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const email = formData.get("email") as string | null;
    const password = formData.get("password") as string | null;

    if (!email || !password)
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );

    const { account, tables } = await getAdminServices();
    const session = await account.createEmailPasswordSession({
      email,
      password,
    });

    const playerResult = await tables.listRows({
      databaseId: appwriteConfig.database.main.id,
      tableId: appwriteConfig.database.main.tables.player.id,
      queries: [
        Query.equal("userId", session.userId),
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

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return NextResponse.json({
      success: true,
      userId: session.userId,
      playerId: player.$id,
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Login failed" },
      { status: 401 }
    );
  }
}
