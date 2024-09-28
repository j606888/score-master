import prisma from "@/db"

// records = [ { id: 1, score: 100 }]
export default async function handler(req, res) {
  const { room_id } = req.query

  if (req.method === 'POST') {
    const { records } = req.body

    const game = await prisma.games.create({
      data: {
        room_id: Number(room_id),
        recorded_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      }
    })

    try {
      const createdRecords = await Promise.all(records.map(async (record) => {
        return await prisma.records.create({
          data: {
            game_id: Number(game.id),
            player_id: Number(record.player_id),
            score: Number(record.score),
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
      }));

      res.status(201).json({ message: 'Records created successfully', records: createdRecords });
    } catch (error) {
      console.error('Error creating records:', error);
      res.status(500).json({ error: 'Failed to create records' });
    }
  }
}