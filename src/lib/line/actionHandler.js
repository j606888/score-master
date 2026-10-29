import prisma from "@/db";
import { SOURCE_MAP } from "./parseMessage";
import buildMessage, { TYPES } from "./buildMessage";
import { DEFAULT_MENU_KEYWORDS } from "@/lib/playerRole";

export const SAVE_SUCCESS_TEXT = "紀錄成功";

// 回傳 null 代表這則訊息不是指令，不用回覆
export async function handleAction(text, source) {
  const sourceMap = SOURCE_MAP[source.type];
  if (!sourceMap) return null;

  const action = text.trim().toLowerCase();
  let lineSource = await prisma.lineSource.findFirst({
    where: {
      source_type: sourceMap.sourceType,
      source_id: source[sourceMap.sourceKey]
    }
  });

  let type = null;
  if (action === SAVE_SUCCESS_TEXT) {
    type = TYPES.SAVE;
  } else if (menuKeywords(lineSource).some(keyword => keyword.toLowerCase() === action)) {
    type = TYPES.MENU;
  }
  if (!type) return null;

  lineSource = lineSource || await createLineSource(source);
  const room = await findOrCreateRoom(lineSource);
  return await buildMessage(type, room, menuKeywords(lineSource));
}

export function menuKeywords(lineSource) {
  const keywords = lineSource?.menu_keywords;
  return keywords?.length ? keywords : DEFAULT_MENU_KEYWORDS;
}

async function createLineSource(source) {
  const sourceMap = SOURCE_MAP[source.type];
  return await prisma.lineSource.create({
    data: {
      source_type: sourceMap.sourceType,
      source_id: source[sourceMap.sourceKey],
    }
  });
}

async function findOrCreateRoom(lineSource) {
  let room
  if (lineSource.room_id) {
    room = await prisma.room.findFirst({
      where: {
        id: lineSource.room_id
      }
    });
  } else {
    room = await prisma.room.create({
      data: {
        name: '麻將小房間',
      }
    });

    await prisma.roomMap.create({
      data: {
        room_id: Number(room.id),
        line_source_id: Number(lineSource.id),
      }
    })

    await prisma.lineSource.update({
      where: {
        id: Number(lineSource.id)
      },
      data: {
        room_id: Number(room.id)
      }
    })
  }

  return room
}
