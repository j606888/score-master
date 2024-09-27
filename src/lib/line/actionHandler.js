import saveSuccess from "./saveSuccess.json";
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
  } else if (action === "save") {
    return saveSuccess;
  } else if (action === "rooms") {
    const rooms = await fetchRooms();
    return {
      type: "text",
      text: "wait for users"
    }
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

  
  lineSource = await prisma.line_sources.findFirst({
    where: {
      source_type: sourceMap.sourceType,
      source_id: source[sourceMap.sourceKey]
    }
  });

  if (!lineSource) {
    lineSource = await prisma.line_sources.create({
      data: {
        source_type: sourceMap.sourceType,
        source_id: source[sourceMap.sourceKey],
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  }
  
  return lineSource;
}

async function findOrCreateRoom(lineSource) {
  let room
  if (lineSource.room_id) {
    room = await prisma.rooms.findFirst({
      where: {
        id: lineSource.room_id
      }
    });
  } else {
    room = await prisma.rooms.create({
      data: {
        name: '麻將小房間',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    await prisma.room_maps.create({
      data: {
        room_id: Number(room.id),
        line_source_id: Number(lineSource.id),
        created_at: new Date(),
        updated_at: new Date()
      }
    })
  }

  return room
}

async function fetchRooms() {
  const rooms = await prisma.rooms.findMany();

  console.log("rooms", rooms);
}