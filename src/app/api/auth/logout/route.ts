import { NextResponse } from "next/server";
import { createSessionClient } from "@/lib/appwrite/client";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const { account } = await createSessionClient();
    await account.deleteSession({ sessionId: "current" });
  } catch (err) {
    console.error("Failed to log out:", err);
  } finally {
    (await cookies()).delete("appwrite-session");
    return NextResponse.json({ success: true });
  }
}
