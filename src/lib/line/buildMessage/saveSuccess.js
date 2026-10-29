import prisma from "@/db"
import { roomLiffUrl } from "@/lib/roomAccess"
import { isFee, DEFAULT_MENU_KEYWORDS } from "@/lib/playerRole"
import { formatScore, formatGameTime } from "@/utils/format"
import { COLORS, loadStandings, scoreColor, scoreBarRow, feeRow, primaryButton, outlineButton, footer } from "./flex"

const TOP_COUNT = 5

export default async function saveSuccess(room, menuKeywords = DEFAULT_MENU_KEYWORDS) {
  const lastGame = await prisma.game.findFirst({
    where: {
      room_id: Number(room.id)
    },
    orderBy: {
      created_at: 'desc'
    },
    include: {
      records: {
        include: {
          player: true
        }
      }
    }
  });

  if (!lastGame) {
    return {
      type: "text",
      text: "這個房間還沒有任何紀錄"
    };
  }

  const { ranked, fees } = await loadStandings(room.id)
  const rankAfter = rankMap(ranked)
  // 扣掉這局，算出這局之前的名次
  const before = ranked
    .map(player => {
      const thisGame = player.records.filter(record => record.game_id === lastGame.id)
      return {
        ...player,
        totalScore: player.totalScore - thisGame.reduce((sum, record) => sum + (record.score || 0), 0),
        played: player.records.length > thisGame.length,
      }
    })
    .filter(player => player.played)
    .sort((a, b) => b.totalScore - a.totalScore)
  const rankBefore = rankMap(before)

  const gameRecords = lastGame.records.filter(record => !isFee(record.player)).sort((a, b) => b.score - a.score)
  const feeRecords = lastGame.records.filter(record => isFee(record.player))

  const rows = gameRecords.flatMap(record => {
    const rank = rankAfter.get(String(record.player_id))
    const prev = rankBefore.get(String(record.player_id))
    return [{ type: "separator", color: "#EEF0EF" }, gameRow(record.player.name, record.score, rank, prev)]
  })

  const feeRows = feeRecords.map(record => {
    const fee = fees.find(f => f.id === record.player_id) || { ...record.player, totalScore: record.score }
    return feeRow(fee, [
      { type: "span", text: `${formatScore(record.score)}  `, weight: "bold", color: COLORS.feeText },
      { type: "span", text: `累積 ${fee.totalScore.toLocaleString("en-US")}`, color: COLORS.feeSub },
    ])
  })

  const top = ranked.slice(0, TOP_COUNT)
  const maxAbs = Math.max(0, ...top.map(player => Math.abs(player.totalScore)))

  return {
    type: "flex",
    altText: `紀錄完成：${room.name}`,
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "horizontal",
        backgroundColor: COLORS.felt,
        paddingTop: "14px",
        paddingBottom: "12px",
        paddingStart: "20px",
        paddingEnd: "20px",
        spacing: "md",
        alignItems: "center",
        contents: [
          {
            type: "box",
            layout: "vertical",
            width: "32px",
            height: "32px",
            cornerRadius: "16px",
            backgroundColor: "#7EE0A8",
            justifyContent: "center",
            contents: [{ type: "text", text: "✓", color: COLORS.felt, weight: "bold", align: "center" }],
          },
          {
            type: "box",
            layout: "vertical",
            flex: 1,
            contents: [
              { type: "text", text: "紀錄完成", color: "#FFFFFF", weight: "bold", size: "lg" },
              { type: "text", text: `${room.name} · ${formatGameTime(lastGame.created_at)}`, color: COLORS.feltSub, size: "xs", wrap: true },
            ],
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        paddingTop: "12px",
        paddingBottom: "4px",
        paddingStart: "16px",
        paddingEnd: "16px",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            paddingBottom: "4px",
            contents: [
              { type: "text", text: "本局", size: "xxs", color: COLORS.muted, flex: 1 },
              { type: "text", text: "輸贏", size: "xxs", color: COLORS.muted, align: "end", flex: 0 },
              { type: "box", layout: "vertical", width: "84px", contents: [{ type: "text", text: "名次", size: "xxs", color: COLORS.muted, align: "end" }] },
            ],
          },
          ...rows,
          ...(feeRows.length ? [{ type: "box", layout: "vertical", spacing: "xs", margin: "sm", contents: feeRows }] : []),
          ...(top.length ? [{
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "xs",
            paddingAll: "10px",
            paddingStart: "12px",
            paddingEnd: "12px",
            backgroundColor: "#F2F5F3",
            cornerRadius: "10px",
            contents: [
              { type: "text", text: `最新排行 · 前 ${top.length}`, size: "xs", weight: "bold", color: "#4A544F" },
              ...top.map(player => scoreBarRow(player.name, player.totalScore, maxAbs, "48px")),
            ],
          }] : []),
        ],
      },
      footer: footer([
        // 送出關鍵字，bot 會回完整的戰績選單
        primaryButton("完整排行", { type: "message", label: "完整排行", text: menuKeywords[0] }),
        outlineButton("再記一局", { type: "uri", label: "再記一局", uri: roomLiffUrl(room.id, "games/new") }),
      ]),
    }
  };
}

function rankMap(players) {
  return new Map(players.map((player, index) => [String(player.id), index + 1]))
}

function gameRow(name, score, rank, prev) {
  let move = { text: "—", color: COLORS.muted }
  if (!prev) move = { text: "新", color: COLORS.win }
  else if (prev > rank) move = { text: `↑${prev - rank}`, color: COLORS.win }
  else if (prev < rank) move = { text: `↓${rank - prev}`, color: COLORS.lose }

  return {
    type: "box",
    layout: "horizontal",
    alignItems: "center",
    height: "34px",
    contents: [
      { type: "text", text: name, weight: "bold", flex: 1, wrap: false },
      { type: "text", text: formatScore(score), weight: "bold", align: "end", flex: 0, color: scoreColor(score) },
      {
        type: "box",
        layout: "vertical",
        width: "84px",
        contents: [{
          type: "text",
          size: "sm",
          align: "end",
          contents: [
            { type: "span", text: `第 ${rank} `, color: "#4A544F" },
            { type: "span", text: move.text, weight: "bold", color: move.color },
          ],
        }],
      },
    ],
  }
}
