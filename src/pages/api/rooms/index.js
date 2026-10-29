import prisma from "@/db"
import { roomPageUrl } from "@/lib/roomAccess"

export default async function handler(req, res) {
  const { skip_empty } = req.query
  const page = clampInt(req.query.page, 1, 1, Number.MAX_SAFE_INTEGER)
  const perPage = clampInt(req.query.per_page, 10, 1, 50)
  const rooms = await prisma.room.findMany({
    skip: (page - 1) * perPage,
    take: perPage,
    where: {
      ...(skip_empty ? { games: { some: {} } } : {})
    },
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
    gamesCount: room._count.games,
    gamesUrl: roomPageUrl(room.id, "games")
  }));
  res.status(200).json(formattedRooms);
}

function clampInt(value, fallback, min, max) {
  const n = parseInt(value, 10)
  if (Number.isNaN(n)) return fallback
  return Math.min(Math.max(n, min), max)
}
