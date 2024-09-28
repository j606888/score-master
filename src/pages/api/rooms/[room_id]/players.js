import prisma from "@/db";

export default async function handler(req, res) {
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
      res.status(200).json({ players: playersWithTotalScore });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  } else if (req.method === 'POST') {
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    try {
      await prisma.player.create({
        data: {
          name,
          room_id: +room_id
        },
      });

      res.status(200).end()
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
}
