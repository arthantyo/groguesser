import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ID, Query } from "node-appwrite";
import { getAdminServices } from "@/lib/appwrite/server";
import { appwriteConfig } from "@/utils/constants";
import { PlayerStatus } from "@/utils/game";

// validation helpers
function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePassword(password: string) {
  return password.length >= 6;
}
function validateUsername(username: string) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const username = formData.get("username") as string | null;
    const email = formData.get("email") as string | null;
    const password = formData.get("password") as string | null;

    if (!email || !password || (!username && formData.has("username"))) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (!validateEmail(email))
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    if (!validatePassword(password))
      return NextResponse.json({ error: "Password too weak" }, { status: 400 });
    if (username && !validateUsername(username))
      return NextResponse.json({ error: "Invalid username" }, { status: 400 });

    const { account, tables } = await getAdminServices();

    let userId: string | null = null;
    let playerId: string | null = null;

    if (username) {
      const existing = await tables.listRows({
        databaseId: appwriteConfig.database.main.id,
        tableId: appwriteConfig.database.main.tables.player.id,
        queries: [Query.equal("username", username)],
      });
      if (existing.total > 0)
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 409 }
        );

      userId = ID.unique();
      await account.create({ userId, email, password });

      playerId = ID.unique();
      await tables.createRow({
        databaseId: appwriteConfig.database.main.id,
        tableId: appwriteConfig.database.main.tables.player.id,
        rowId: ID.unique(),
        data: {
          username,
          userId,
          status: PlayerStatus.IDLE,
          score: 0,
        },
      });
    }

    const session = await account.createEmailPasswordSession({
      email,
      password,
    });

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return NextResponse.json({ playerId, userId });
  } catch (error: any) {
    console.error("Register error:", error);

    // attempt cleanup if something failed
    if (error.userId) {
      try {
        const { users } = await getAdminServices();
        await users.delete({ userId: error.userId });
      } catch {}
    }

    return NextResponse.json(
      { error: error?.message ?? "Register failed" },
      { status: 500 }
    );
  }
}
