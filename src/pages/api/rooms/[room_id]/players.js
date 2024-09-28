// /pages/api/users/index.js
import prisma from "@/db";

export default async function handler(req, res) {
  const { room_id } = req.query;

  if (req.method === 'GET') {
    // Handle GET request: Fetch all users
    try {
      const players = await prisma.player.findMany({
        where: {
          room_id: Number(room_id)
        },
        include: {
          records: true
        },
        orderBy: {
          id: 'desc'
        }
      });
      const serializedPlayers = players.map(player => ({
        ...player,
        id: Number(player.id),
        gian_count: Number(player.gian_count),
        total_score: player.records.reduce((sum, record) => sum + (record.score || 0), 0),
        records: undefined // Remove records from the response
      }));
      res.status(200).json({ players: serializedPlayers });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  } else if (req.method === 'POST') {
    // Handle POST request: Create a new user
    const { name } = req.body

    // Basic validation
    if (!name) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    try {
      const newUser = await prisma.player.create({
        data: {
          name,
          room_id: Number(room_id),
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      res.status(201).json({
        player: {
          ...newUser,
          id: Number(newUser.id),
          gian_count: Number(newUser.gian_count)
        }
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  } else {
    // Method not allowed
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
