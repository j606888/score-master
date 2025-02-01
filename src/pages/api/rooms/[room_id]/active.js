import prisma from "@/db";

export default async function handler(req, res) {
  const { room_id } = req.query;

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

  if (req.method === 'POST') {
    const { new_room_id } = req.body
    await prisma.lineSource.update({
      where: {
        id: lineSource.id
      },
      data: {
        room_id: Number(new_room_id)
      }
    })
    

    res.status(200).json({ ok: true })
  }
}