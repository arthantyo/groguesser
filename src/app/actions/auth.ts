"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ID, Query } from "node-appwrite";
import { getAdminServices } from "@/lib/appwrite/server";
import { createSessionClient } from "../../lib/appwrite/client";
import { appwriteConfig } from "../../utils/constants";
import { PlayerStatus } from "../../utils/game";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string) {
  return password.length >= 6; // can enhance with strength checks
}

function validateUsername(username: string) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

export async function signUpWithEmail(formData: FormData) {
  const username = formData.get("username") as string | null;
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  if (!email || !password || (!username && formData.has("username"))) {
    throw new Error("Missing fields");
  }

  if (!validateEmail(email)) throw new Error("Invalid email format");
  if (!validatePassword(password)) throw new Error("Password too weak");
  if (username && !validateUsername(username))
    throw new Error("Invalid username");

  const { account, tables, users } = await getAdminServices();

  // TODO: create player store if new
  let userId: string | null = null;

  try {
    if (username) {
      const existing = await tables.listRows({
        databaseId: appwriteConfig.database.main.id,
        tableId: appwriteConfig.database.main.tables.player.id,
        queries: [Query.equal("username", username)],
      });
      if (existing.total > 0) throw new Error("Username already taken");

      userId = ID.unique();
      await account.create({ userId, email, password });

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

    redirect("/account");
  } catch (error) {
    console.error("Sign-up error:", error);

    if (username && userId) {
      try {
        await users.delete({
          userId,
        });
      } catch (_) {}
    }

    throw new Error(error instanceof Error ? error.message : "Sign-up failed");
  }
}

export async function signInWithEmail(formData: FormData) {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  if (!email || !password) {
    throw new Error("Missing email or password");
  }

  const { account } = await getAdminServices();

  // TODO: create auth session
  const session = await account.createEmailPasswordSession({ email, password });

  // Set session cookie
  (await cookies()).set("appwrite-session", session.secret, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  });

  redirect("/account");
}

export async function logoutUser() {
  try {
    const { account } = await createSessionClient();
    await account.deleteSession({ sessionId: "current" }); // updated API

    // Redirect to login page
  } catch (err) {
    console.error("Failed to log out:", err);
  } finally {
    redirect("/");
  }
}
