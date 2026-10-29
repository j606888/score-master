import prisma from "@/db"
import { withRoomAccess } from "@/lib/roomAccess"

export default withRoomAccess(async function handler(req, res, room) {
  const { room_id } = req.query

  if (req.method === 'GET') {
    const draftRecords = await prisma.draftRecord.findMany({
      where: {
        room_id: +room_id
      }
    })

    res.status(200).json(draftRecords)
  }

  if (req.method === 'POST') {
    const { player_id, score } = req.body

    if (!Number.isInteger(Number(player_id))) {
      return res.status(400).json({ error: 'Invalid player_id' })
    }
    // 前端清空分數時會送 null，維持原本行為
    if (score !== null && !Number.isInteger(Number(score))) {
      return res.status(400).json({ error: 'Invalid score' })
    }
    const player = await prisma.player.findFirst({
      where: { id: Number(player_id), room_id: room.id }
    })
    if (!player) {
      return res.status(400).json({ error: 'Player does not belong to this room' })
    }

    await prisma.draftRecord.create({
      data: {
        player_id: +player_id,
        room_id: +room_id,
        score: +score
      }
    })

    res.status(200).end()
  }

  if (req.method === 'DELETE') {
    await prisma.draftRecord.deleteMany({
      where: {
        room_id: +room_id
      }
    })
    res.status(200).end()
  }
})
