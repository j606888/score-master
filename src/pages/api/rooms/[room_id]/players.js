import prisma from "@/db";
import { withRoomAccess } from "@/lib/roomAccess";
import { PLAYER_ROLE } from "@/lib/playerRole";

const ROLES = Object.values(PLAYER_ROLE);

export default withRoomAccess(async function handler(req, res, room) {
  const { room_id } = req.query;

  if (req.method === 'GET') {
    try {
      const players = await prisma.player.findMany({
        where: {
          room_id: +room_id
        },
        include: {
          records: true
        },
        orderBy: {
          id: 'desc'
        }
      });
      const playersWithTotalScore = players.map(player => {
        const totalScore = player.records.reduce((sum, record) => sum + (record.score || 0), 0);
        return {
          ...player,
          total_score: totalScore,
          records: undefined
        };
      });
      const sortedPlayers = playersWithTotalScore.sort((a, b) => b.total_score - a.total_score);

      // 記一局預設勾選上一局的玩家
      const lastGame = await prisma.game.findFirst({
        where: { room_id: room.id },
        orderBy: { created_at: 'desc' },
        include: { records: { select: { player_id: true } } }
      });
      const lastGamePlayerIds = lastGame?.records.map(record => record.player_id) || [];

      res.status(200).json({ players: sortedPlayers, last_game_player_ids: lastGamePlayerIds });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  } else if (req.method === 'POST') {
    const { name, role = PLAYER_ROLE.NORMAL } = req.body
    const trimmedName = typeof name === 'string' ? name.trim() : ''

    if (!trimmedName) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    try {
      await prisma.player.create({
        data: {
          name: trimmedName,
          role,
          room_id: +room_id
        },
      });

      res.status(200).end()
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  } else if (req.method === 'PATCH') {
    // 切換一般玩家 / 場地費
    const { id, role } = req.body

    if (!Number.isInteger(Number(id)) || !ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid player' });
    }

    const result = await prisma.player.updateMany({
      where: { id: Number(id), room_id: room.id },
      data: { role }
    });
    if (result.count === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.status(200).end()
  }
})
