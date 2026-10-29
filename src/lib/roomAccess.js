import crypto from "crypto";
import prisma from "@/db";

// 房間連結簽章：只有 bot 在 LINE 送出的連結（帶 ?s=）才能進入房間。
// 簽章驗過後存成 cookie，之後頁面間的連結與 API 呼叫都靠 cookie 驗證。
const SECRET = process.env.ROOM_LINK_SECRET;
const LIFF_ID = process.env.NEXT_PUBLIC_LINE_LIFF_ID;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function signRoom(roomId) {
  if (!SECRET) throw new Error("ROOM_LINK_SECRET is not set");
  return crypto
    .createHmac("sha256", SECRET)
    .update(`room:${roomId}`)
    .digest("base64url")
    .slice(0, 22);
}

// path 例如 "games/new"
export function roomLiffUrl(roomId, path) {
  return `https://liff.line.me/${LIFF_ID}/rooms/${roomId}/${path}?s=${signRoom(roomId)}`;
}

export function roomPageUrl(roomId, path) {
  return `/liff/rooms/${roomId}/${path}?s=${signRoom(roomId)}`;
}

function isValidRoomSig(roomId, sig) {
  if (!SECRET || typeof sig !== "string") return false;
  const expected = Buffer.from(signRoom(roomId));
  const received = Buffer.from(sig);
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

function parseRoomId(value) {
  return typeof value === "string" && /^\d+$/.test(value) ? value : null;
}

function cookieName(roomId) {
  return `room_${roomId}`;
}

// LIFF 頁面的 getServerSideProps
export async function getRoomPageProps(context) {
  const { params, query, req, res } = context;
  const roomId = parseRoomId(params.room_id);
  if (!roomId) return { notFound: true };

  if (isValidRoomSig(roomId, query.s)) {
    res.setHeader(
      "Set-Cookie",
      `${cookieName(roomId)}=${query.s}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`
    );
  } else if (!isValidRoomSig(roomId, req.cookies[cookieName(roomId)])) {
    return { redirect: { destination: "/liff/invalid-link", permanent: false } };
  }

  return { props: { room_id: Number(roomId) } };
}

// /api/rooms/[room_id]/* 的 handler 包裝：驗 cookie 簽章並載入房間
export function withRoomAccess(handler) {
  return async (req, res) => {
    const roomId = parseRoomId(req.query.room_id);
    if (!roomId) {
      return res.status(404).json({ error: "Room not found" });
    }
    if (!isValidRoomSig(roomId, req.cookies[cookieName(roomId)])) {
      return res.status(401).json({ error: "Invalid room link" });
    }

    const room = await prisma.room.findUnique({ where: { id: BigInt(roomId) } });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    return handler(req, res, room);
  };
}
