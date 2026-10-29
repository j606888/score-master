import crypto from "crypto";
import { replyToMessage } from "@/lib/line/lineApi";
import { parseMessage } from "@/lib/line/parseMessage";
import { handleAction } from "@/lib/line/actionHandler";

// 簽章要對原始 body 計算，所以關掉 Next.js 的 bodyParser
export const config = {
  api: {
    bodyParser: false,
  },
};

const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

function isValidSignature(rawBody, signature) {
  if (typeof signature !== "string") return false;

  const expected = Buffer.from(
    crypto.createHmac("sha256", CHANNEL_SECRET).update(rawBody).digest("base64")
  );
  const received = Buffer.from(signature);

  // timingSafeEqual 要求長度相同
  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(expected, received);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end();
    return;
  }

  if (!CHANNEL_SECRET) {
    console.error("LINE_CHANNEL_SECRET is not set");
    res.status(500).end();
    return;
  }

  const rawBody = await readRawBody(req);

  if (!isValidSignature(rawBody, req.headers["x-line-signature"])) {
    res.status(401).end();
    return;
  }

  let body;
  try {
    body = JSON.parse(rawBody.toString("utf8"));
  } catch {
    res.status(400).end();
    return;
  }

  if (!Array.isArray(body?.events)) {
    res.status(400).end();
    return;
  }

  // LINE Console 的 Verify 會送空的 events
  if (body.events.length === 0) {
    res.status(200).end();
    return;
  }

  const event = body.events[0];
  if (event?.type !== "message" || event.message?.type !== "text") {
    res.status(200).end();
    return;
  }

  const { replyToken, message, source } = parseMessage(body);

  try {
    const handleActionResponse = await handleAction(message, source);
    const messages = [
      handleActionResponse
    ]

    await replyToMessage(replyToken, messages);
  } catch (error) {
    // LINE API 的錯誤細節已在 replyToMessage 記錄；這裡不記整個 error 物件
    console.error("Webhook handling failed:", error?.name, error?.message);
  }

  res.status(200).end();
}
