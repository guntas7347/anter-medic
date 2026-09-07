"use server";

import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  signJwt,
  setSessionCookie,
  clearSessionCookie,
  getAuthenticatedDoctor,
} from "@/lib/auth";
import { ALLOWED_ADMIN_USERNAMES } from "@/lib/config";
import { redirect } from "next/navigation";

export async function loginAction(values: {
  username: string;
  password: string;
}) {
  const rawUsername = values.username?.trim().toLowerCase() || "";
  const password = values.password;

  if (!rawUsername || !password) {
    return { error: "Please enter both username and password." };
  }

  const cleanUsername = rawUsername.replace(/^dr[._]?/, "");

  if (
    !ALLOWED_ADMIN_USERNAMES.includes(rawUsername) &&
    !ALLOWED_ADMIN_USERNAMES.includes(cleanUsername)
  ) {
    return {
      error: "Access denied. Username is not authorized for clinic admin.",
    };
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: rawUsername }, { username: cleanUsername }],
    },
  });

  if (!user) {
    return { error: "Invalid username or password." };
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return { error: "Invalid username or password." };
  }

  const token = signJwt({ userId: user.id, username: user.username });
  await setSessionCookie(token);

  return { success: true };
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin");
}

export async function getAuthSession() {
  return await getAuthenticatedDoctor();
}
