import prisma from "@/db"

export default async function handler(req, res) {
  const { room_id, id } = req.query

  if (req.method === 'DELETE') {
    await prisma.draftRecord.delete({
      where: { id: +id, room_id: +room_id }
    })
  }

  res.status(200).end()
}