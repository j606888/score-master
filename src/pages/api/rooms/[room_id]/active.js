import prisma from "@/db";
import { withRoomAccess } from "@/lib/roomAccess";

export default withRoomAccess(async function handler(req, res, room) {
  const roomMap = await prisma.roomMap.findFirst({
    where: { room_id: room.id },
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

  if (req.method === 'POST') {
    const { new_room_id } = req.body

    // 只能切換到同一個 LINE 聊天室底下的房間
    const ownsRoom = lineSource.roomMaps.some(rm => String(rm.room_id) === String(new_room_id))
    if (!ownsRoom) {
      return res.status(400).json({ error: "Room does not belong to this chat" })
    }

    await prisma.lineSource.update({
      where: {
        id: lineSource.id
      },
      data: {
        room_id: Number(new_room_id)
      }
    })


    res.status(200).json({ ok: true })
    return
  }

  res.setHeader('Allow', 'POST')
  res.status(405).end()
})
