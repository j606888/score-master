import prisma from "@/db";

export default async function handler(req, res) {
  const { room_id } = req.query;

  const room = await prisma.room.findUnique({
    where: { id: BigInt(room_id) },
  });
  const roomMap = await prisma.roomMap.findFirst({
    where: { room_id: BigInt(room_id) },
  });

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
}