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
    const { player_id, score } = req.body

    const existingRecord = await prisma.draftRecord.findFirst({
      where: {
        player_id: +player_id,
        room_id: +room_id
      }
    })

    if (existingRecord) {
      if (score === null) {
        await prisma.draftRecord.delete({
          where: {
            id: existingRecord.id
          }
        })
      } else {
        await prisma.draftRecord.update({
          where: {
            id: existingRecord.id
          },
          data: {
            score: +score
          }
        })
      }
    }

    if (!existingRecord && score !== null) {
      await prisma.draftRecord.create({
        data: {
          player_id: +player_id,
          room_id: +room_id,
          score: +score
        }
      })
    }

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