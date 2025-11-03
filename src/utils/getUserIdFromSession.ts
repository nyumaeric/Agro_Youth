import { getServerSession } from "next-auth";

import { options } from "@/auth";
import db from "@/server/db";
import { roles, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function getUserIdFromSession(): Promise<string | null> {
  try {
    const session = await getServerSession(options);
    console.log("session", session);
    if (!session || !session.user?.id) {
      return null;
    }

    return session.user.id;
  } catch (error) {
    return null;
  }
}
export async function getUserTypeFromSession(): Promise<string | null> {
  try {
    const session = await getServerSession(options);
    console.log("session", session);
    if (!session || !session.user?.userType) {
      return null;
    }

    return session.user.userType;
  } catch (error) {
    return null;
  }
}

async function getUserRoleWithId(): Promise<{ userId: string; role: string } | null> {
  const userId = await getUserIdFromSession();
  if (!userId) return null;

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user[0]?.role) return null;

  const role = await db.select().from(roles).where(eq(roles.id, user[0].role as string)).limit(1);
  if (!role[0]?.name) return null;
  return { userId, role: role[0].name };
}


export async function checkIfUserIsAdmin(): Promise<boolean> {
  const userRole = await getUserRoleWithId();
  return userRole?.role === "Admin";
}