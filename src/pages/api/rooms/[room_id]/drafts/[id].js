import prisma from "@/db"
import { withRoomAccess } from "@/lib/roomAccess"

export default withRoomAccess(async function handler(req, res) {
  const { room_id, id } = req.query

  if (req.method === 'DELETE') {
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid id' })
    }

    // deleteMany：草稿已被別人刪掉時不會丟錯
    await prisma.draftRecord.deleteMany({
      where: { id: +id, room_id: +room_id }
    })
  }

  res.status(200).end()
})
