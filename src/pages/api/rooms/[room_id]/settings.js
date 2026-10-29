import prisma from "@/db";
import { withRoomAccess } from "@/lib/roomAccess";
import { menuKeywords, SAVE_SUCCESS_TEXT } from "@/lib/line/actionHandler";
import { isFee } from "@/lib/playerRole";

const MAX_KEYWORDS = 10;
const MAX_KEYWORD_LENGTH = 20;

// 關鍵字存在 LINE 聊天室（LineSource）上，切換房間也不會變
async function findLineSource(room) {
  const roomMap = await prisma.roomMap.findFirst({
    where: { room_id: room.id },
  });
  if (!roomMap) return null;

  return prisma.lineSource.findFirst({
    where: { id: roomMap.line_source_id },
  });
}

export default withRoomAccess(async function handler(req, res, room) {
  const lineSource = await findLineSource(room);

  if (req.method === 'GET') {
    const players = await prisma.player.findMany({
      where: { room_id: room.id },
      select: { role: true },
    });
    const feeCount = players.filter(isFee).length;

    return res.status(200).json({
      name: room.name,
      keywords: menuKeywords(lineSource),
      player_count: players.length - feeCount,
      fee_count: feeCount,
    });
  }

  if (req.method === 'PUT') {
    if (!lineSource) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const { keywords } = req.body;
    if (!Array.isArray(keywords)) {
      return res.status(400).json({ error: '關鍵字格式錯誤' });
    }

    const cleaned = [...new Set(keywords.map(keyword => String(keyword).trim()).filter(Boolean))];
    if (cleaned.length === 0) {
      return res.status(400).json({ error: '至少要留一個關鍵字' });
    }
    if (cleaned.length > MAX_KEYWORDS) {
      return res.status(400).json({ error: `最多 ${MAX_KEYWORDS} 個關鍵字` });
    }
    if (cleaned.some(keyword => keyword.length > MAX_KEYWORD_LENGTH)) {
      return res.status(400).json({ error: `關鍵字最多 ${MAX_KEYWORD_LENGTH} 個字` });
    }
    if (cleaned.includes(SAVE_SUCCESS_TEXT)) {
      return res.status(400).json({ error: `「${SAVE_SUCCESS_TEXT}」是系統保留字` });
    }

    await prisma.lineSource.update({
      where: { id: lineSource.id },
      data: { menu_keywords: cleaned },
    });

    return res.status(200).json({ keywords: cleaned });
  }

  res.setHeader('Allow', 'GET, PUT');
  res.status(405).end();
});
