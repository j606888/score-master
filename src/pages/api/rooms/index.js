import prisma from "@/db"

export default async function handler(req, res) {
  const { page, per_page } = req.query
  const rooms = await prisma.room.findMany({
    skip: (+page - 1) * +per_page,
    take: +per_page,
    orderBy: {
      id: 'desc'
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          players: true,
          games: true
        }
      }
    }
  })


  const formattedRooms = rooms.map(room => ({
    id: room.id,
    name: room.name,
    playersCount: room._count.players,
    gamesCount: room._count.games
  }));
  res.status(200).json(formattedRooms);
}