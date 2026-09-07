import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ALLOWED_ADMIN_USERNAMES } from "@/lib/config";

const JWT_SECRET =
  process.env.JWT_SECRET || "anter-medic-secure-jwt-secret-key-2026";
const COOKIE_NAME = "token";

export interface SessionPayload {
  userId: string;
  username: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signJwt(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyJwt(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyJwt(token);
}

export async function getAuthenticatedDoctor() {
  const session = await getSession();
  if (!session) return null;

  const rawUsername = session.username?.trim().toLowerCase() || "";
  const cleanUsername = rawUsername.replace(/^dr[._]?/, "");

  if (
    !ALLOWED_ADMIN_USERNAMES.includes(rawUsername) &&
    !ALLOWED_ADMIN_USERNAMES.includes(cleanUsername)
  ) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: rawUsername }, { username: cleanUsername }],
    },
  });
  if (!user) return null;

  const doctor = await prisma.doctor.findFirst({
    where: {
      OR: [
        { username: user.username },
        { username: rawUsername },
        { username: cleanUsername },
      ],
    },
    include: { clinic: true },
  });

  if (!doctor || !doctor.clinic) return null;

  return {
    user: { id: user.id, username: user.username },
    doctor,
    clinic: doctor.clinic,
  };
}

export async function requireAuth() {
  const auth = await getAuthenticatedDoctor();
  if (!auth || !auth.doctor || !auth.clinic) {
    throw new Error("UNAUTHORIZED");
  }
  return {
    user: auth.user,
    doctor: auth.doctor,
    clinic: auth.clinic,
  };
}
