import prisma from "@/db";
import { SOURCE_MAP } from "./parseMessage";
import buildMessage, { TYPES } from "./buildMessage";

export async function handleAction(text, source) {
  const lineSource = await findOrCreateLineSource(source);
  const room = await findOrCreateRoom(lineSource);

  const action = text.toLowerCase();
  if (action === "麻將") {
    const message = await buildMessage(TYPES.MENU, room);
    return message;
  } else if (action === "紀錄成功") {
    const message = await buildMessage(TYPES.SAVE, room)
    return message
  } else {
    return {
      type: "text",
      text: "I'm sorry, I didn't understand that."
    };
  }
}


async function findOrCreateLineSource(source) {
  const sourceMap = SOURCE_MAP[source.type];
  let lineSource

  lineSource = await prisma.lineSource.findFirst({
    where: {
      source_type: sourceMap.sourceType,
      source_id: source[sourceMap.sourceKey]
    }
  });

  if (!lineSource) {
    lineSource = await prisma.lineSource.create({
      data: {
        source_type: sourceMap.sourceType,
        source_id: source[sourceMap.sourceKey],
      }
    });
  }
  
  return lineSource;
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
