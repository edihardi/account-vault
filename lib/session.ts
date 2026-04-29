import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  isLoggedIn: boolean;
  // Timestamp (ms) kapan PIN terakhir diverifikasi — untuk session timeout reveal
  pinVerifiedAt?: number;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "av_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/** Return true jika PIN diverifikasi dalam 5 menit terakhir */
export function isPinSessionActive(session: SessionData): boolean {
  if (!session.pinVerifiedAt) return false;
  const FIVE_MINUTES = 5 * 60 * 1000;
  return Date.now() - session.pinVerifiedAt < FIVE_MINUTES;
}
