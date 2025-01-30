import prisma from "@/db"

export default async function handler(req, res) {
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
}