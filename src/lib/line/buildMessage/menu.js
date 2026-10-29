import { roomLiffUrl } from "@/lib/roomAccess";
import {
  COLORS, loadStandings, header, scoreBarRow, feeRow, note,
  primaryButton, outlineButton, gearButton, footer,
} from "./flex";

// 人很多時 bubble 會太長（且有 30KB 上限），超過的人看歷史紀錄
const MAX_ROWS = 20;

export default async function menu(room) {
  const { hasPlayers, ranked, idle, fees } = await loadStandings(room.id);

  const addUserUrl = roomLiffUrl(room.id, "players/new")
  const settingUrl = roomLiffUrl(room.id, "settings")
  const newGameUrl = roomLiffUrl(room.id, "games/new")
  const allGamesUrl = roomLiffUrl(room.id, "games")

  if (!hasPlayers) {
    return {
      type: "flex",
      altText: "Menu",
      contents: newMenuJSON(addUserUrl)
    }
  }

  const shown = ranked.slice(0, MAX_ROWS);
  const maxAbs = Math.max(0, ...shown.map(player => Math.abs(player.totalScore)));
  const bodyContents = shown.map(player => scoreBarRow(player.name, player.totalScore, maxAbs));

  if (ranked.length === 0) {
    bodyContents.push({ type: "text", text: "還沒有任何紀錄，按「記一局」開始", size: "sm", color: COLORS.muted, wrap: true });
  }
  if (ranked.length > shown.length) {
    bodyContents.push(note(`還有 ${ranked.length - shown.length} 人，請看歷史紀錄`));
  }
  if (fees.length > 0) {
    bodyContents.push({
      type: "box",
      layout: "vertical",
      spacing: "xs",
      margin: "md",
      contents: fees.map(fee => feeRow(fee)),
    });
  }
  if (idle.length > 0) {
    bodyContents.push(note(`未出場：${idle.map(player => player.name).join("、")}`));
  }

  return {
    type: "flex",
    altText: `${room.name} 戰績`,
    contents: {
      type: "bubble",
      header: header(room.name, `${ranked.length} 人出場 · 依總分排序`),
      body: {
        type: "box",
        layout: "vertical",
        spacing: "xs",
        paddingTop: "12px",
        paddingBottom: "4px",
        paddingStart: "16px",
        paddingEnd: "16px",
        contents: bodyContents,
      },
      footer: footer([
        primaryButton("記一局", { type: "uri", label: "記一局", uri: newGameUrl }),
        outlineButton("歷史紀錄", { type: "uri", label: "歷史紀錄", uri: allGamesUrl }, "92px"),
        gearButton({ type: "uri", label: "設定", uri: settingUrl }),
      ]),
    },
  };
}

function newMenuJSON(addUserUrl) {
  return {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": "歡迎使用十一萬",
          "weight": "bold",
          "size": "lg",
          "margin": "none"
        },
        {
          "type": "text",
          "text": "請先新增玩家來開始使用",
          "margin": "sm"
        }
      ]
    },
    "footer": {
      "type": "box",
      "layout": "vertical",
      "spacing": "sm",
      "contents": [
        {
          "type": "button",
          "style": "primary",
          "height": "sm",
          "color": COLORS.felt,
          "action": {
            "type": "uri",
            "label": "新增玩家",
            "uri": addUserUrl
          }
        }
      ],
      "flex": 0
    }
  }
}
