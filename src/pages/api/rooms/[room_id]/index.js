import prisma from "@/db";
import { withRoomAccess } from "@/lib/roomAccess";

export default withRoomAccess(async function handler(req, res, currentRoom) {
  const roomMap = await prisma.roomMap.findFirst({
    where: { room_id: currentRoom.id },
  });
  if (!roomMap) {
    return res.status(404).json({ error: "Room not found" });
  }

  const lineSource = await prisma.lineSource.findFirst({
    where: { id: roomMap.line_source_id },
    include: {
      roomMaps: {
        include: {
          room: true
        }
      }
    }
  });

  if (req.method === 'GET') {
    const rooms = lineSource?.roomMaps?.map(rm => rm.room) || [];
    const roomsWithActive = rooms.map(room => ({
      ...room,
      active: room.id === BigInt(lineSource.room_id)
    }));
    res.status(200).json(roomsWithActive);
  }

  if (req.method === 'POST') {
    const { name } = req.body
    const room = await prisma.room.create({
      data: {
        name,
      }
    })
    const roomMap = await prisma.roomMap.create({
      data: {
        room_id: Number(room.id),
        line_source_id: Number(lineSource.id)
      }
    })
    await prisma.lineSource.update({
      where: {
        id: lineSource.id
      },
      data: {
        room_id: Number(room.id)
      }
    });
    res.status(200).json({ room, roomMap })
  }
})
