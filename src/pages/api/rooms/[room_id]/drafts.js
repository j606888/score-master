import prisma from "@/db"

export default async function handler(req, res) {
  const { room_id } = req.query

  if (req.method === 'GET') {
    const draftRecords = await prisma.draftRecord.findMany({
      where: {
        room_id: +room_id
      }
    })
    const draftData = draftRecords.reduce((acc, record) => {
      acc[record.player_id] = record.score
      return acc
    }, {})
    res.status(200).json(draftData)
  }

  if (req.method === 'PUT') {
    const { draftData } = req.body

    const records = Object.entries(draftData).map(([player_id, score]) => ({
      player_id: +player_id,
      room_id: +room_id,
      score: +score
    }))

    await prisma.draftRecord.deleteMany({
      where: {
        room_id: +room_id
      }
    })
    await prisma.draftRecord.createMany({
      data: records
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