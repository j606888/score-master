import prisma from "@/db"

// records = [ { id: 1, score: 100 }]
export default async function handler(req, res) {
  const { room_id } = req.query

  if (req.method === 'POST') {
    const { records } = req.body

    const game = await prisma.game.create({
      data: {
        room_id: Number(room_id),
        recorded_at: new Date(),
      }
    })

    try {
      const createdRecords = await Promise.all(records.map(async (record) => {
        return await prisma.record.create({
          data: {
            game_id: Number(game.id),
            player_id: Number(record.player_id),
            score: Number(record.score),
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
      }));

      // Update gian_count for all players in the records
      await Promise.all(records.map(async (record) => {
        await prisma.player.update({
          where: { id: Number(record.player_id) },
          data: {
            gian_count: {
              increment: 1
            }
          }
        });
      }));

      res.status(201).json({ message: 'Records created successfully', records: createdRecords });
    } catch (error) {
      console.error('Error creating records:', error);
      res.status(500).json({ error: 'Failed to create records' });
    }
  }
}