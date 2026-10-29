import prisma from "@/db"
import { withRoomAccess } from "@/lib/roomAccess"
import { isFee } from "@/lib/playerRole"

// records = [ { id: 1, score: 100 }]
export default withRoomAccess(async function handler(req, res, room) {
  const { room_id } = req.query

  if (req.method === 'GET') {
    const games = await prisma.game.findMany({
      where: {
        room_id: +room_id
      },
      include: {
        records: {
          include: {
            player: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    })

    res.status(200).json({
      games: games.map(game => ({
        id: game.id,
        recorded_at: game.recorded_at || game.created_at,
        records: game.records
          .map(record => ({
            player_id: record.player_id,
            name: record.player?.name,
            fee: isFee(record.player),
            score: record.score || 0,
          }))
          .sort((a, b) => b.score - a.score)
      }))
    })
  }

  if (req.method === 'POST') {
    const { records } = req.body

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'records is required' });
    }

    // 每個 player_id 都必須屬於這個房間
    const playerIds = [...new Set(records.map(record => Number(record.player_id)))];
    if (playerIds.some(id => !Number.isInteger(id))) {
      return res.status(400).json({ error: 'Invalid player_id' });
    }
    if (records.some(record => !Number.isInteger(Number(record.score)))) {
      return res.status(400).json({ error: 'Invalid score' });
    }
    const players = await prisma.player.findMany({
      where: { id: { in: playerIds }, room_id: room.id }
    });
    if (players.length !== playerIds.length) {
      return res.status(400).json({ error: 'Player does not belong to this room' });
    }
    // 場地費只收不輸
    const feeIds = new Set(players.filter(isFee).map(player => Number(player.id)));
    if (records.some(record => feeIds.has(Number(record.player_id)) && Number(record.score) < 0)) {
      return res.status(400).json({ error: 'Fee cannot be negative' });
    }

    try {
      // Game、Record、gian_count 一起成功或一起失敗，避免留下沒有分數的 Game
      const createdRecords = await prisma.$transaction(async (tx) => {
        const game = await tx.game.create({
          data: {
            room_id: Number(room_id),
            recorded_at: new Date(),
          }
        })

        const created = await Promise.all(records.map(async (record) => {
          return await tx.record.create({
            data: {
              game_id: Number(game.id),
              player_id: Number(record.player_id),
              score: Number(record.score),
              created_at: new Date(),
              updated_at: new Date(),
            },
          });
        }));

        // 場地費不算出場數
        await Promise.all(records.filter(record => !feeIds.has(Number(record.player_id))).map(async (record) => {
          await tx.player.update({
            where: { id: Number(record.player_id) },
            data: {
              gian_count: {
                increment: 1
              }
            }
          });
        }));

        return created;
      });

      res.status(201).json({ message: 'Records created successfully', records: createdRecords });
    } catch (error) {
      console.error('Error creating records:', error);
      res.status(500).json({ error: 'Failed to create records' });
    }
  }
})
