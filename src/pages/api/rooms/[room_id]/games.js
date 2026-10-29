import prisma from "@/db"
import { withRoomAccess } from "@/lib/roomAccess"

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
        recorded_at: 'desc'
      }
    })

    const excelData = _transformGamesToExcelData(games);
    res.status(200).json(excelData)
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
    const playerCount = await prisma.player.count({
      where: { id: { in: playerIds }, room_id: room.id }
    });
    if (playerCount !== playerIds.length) {
      return res.status(400).json({ error: 'Player does not belong to this room' });
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

        // Update gian_count for all players in the records
        await Promise.all(records.map(async (record) => {
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

function _transformGamesToExcelData(games) {
  const playerMap = new Map();
  const playerTotalScores = new Map();

  games.forEach(game => game.records.forEach(record => {
    const playerId = record.player.id;
    playerMap.set(playerId, record.player.name);
    playerTotalScores.set(playerId, (playerTotalScores.get(playerId) || 0) + record.score);
  }));

  const headers = [
    ...Array.from(playerMap, ([id, name]) => ({
      id: id.toString(),
      label: name,
      totalScore: playerTotalScores.get(id)
    }))
  ].sort((a, b) => b.totalScore - a.totalScore);

  const rows = games.map(game => {
    const row = {
      Date: new Date(game.recorded_at).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Taipei'
      }).replace(/(\d+)\/(\d+)\/(\d+)/, '$3/$1/$2')
    };
    playerMap.forEach((name, id) => {
      const record = game.records.find(r => r.player.id === id);
      row[id] = record ? record.score : null;
    });
    return row;
  });

  return { headers, rows };
}