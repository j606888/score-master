import prisma from "@/db";
import { isFee } from "@/lib/playerRole";
import { formatScore } from "@/utils/format";

export const COLORS = {
  felt: "#16423C",
  feltSub: "#D3E4DC",
  win: "#1C6B4C",
  winBar: "#2F8A63",
  lose: "#B23A26",
  loseBar: "#D9735F",
  muted: "#6B746F",
  border: "#D5DCD8",
  axis: "#C9D1CD",
  feeBg: "#F5F1E8",
  feeText: "#4A4335",
  feeSub: "#6B5F45",
};

// Flex 的圖片要完整的 https 網址；Vercel 會自動提供 VERCEL_PROJECT_PRODUCTION_URL
const APP_URL = process.env.APP_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);

export const scoreColor = (score) => (score >= 0 ? COLORS.win : COLORS.lose);

// 一般玩家依總分排序（只算有出場的），場地費另外列出累積金額
export async function loadStandings(roomId) {
  const players = await prisma.player.findMany({
    where: { room_id: Number(roomId) },
    include: { records: true },
    orderBy: { id: "asc" },
  });

  const withTotal = players.map(player => ({
    ...player,
    totalScore: player.records.reduce((sum, record) => sum + (record.score || 0), 0),
  }));
  const normal = withTotal.filter(player => !isFee(player));

  return {
    hasPlayers: players.length > 0,
    ranked: normal
      .filter(player => player.records.length > 0)
      .sort((a, b) => b.totalScore - a.totalScore),
    idle: normal.filter(player => player.records.length === 0),
    fees: withTotal.filter(isFee),
  };
}

export function header(title, subtitle) {
  return {
    type: "box",
    layout: "vertical",
    backgroundColor: COLORS.felt,
    paddingTop: "14px",
    paddingBottom: "12px",
    paddingStart: "20px",
    paddingEnd: "20px",
    spacing: "xs",
    contents: [
      { type: "text", text: title, color: "#FFFFFF", weight: "bold", size: "lg", wrap: true },
      { type: "text", text: subtitle, color: COLORS.feltSub, size: "xs", wrap: true },
    ],
  };
}

function fixedBox(width, contents, extra = {}) {
  return { type: "box", layout: "vertical", width, justifyContent: "center", contents, ...extra };
}

function bar(width, color, radius) {
  return {
    type: "box",
    layout: "vertical",
    width,
    height: "12px",
    backgroundColor: color,
    cornerRadius: radius,
    contents: [],
  };
}

// 名字 | 輸 ◀ 中線 ▶ 贏 | 分數
export function scoreBarRow(name, score, maxAbs, nameWidth = "52px") {
  const width = `${Math.max(2, Math.round((Math.abs(score) / (maxAbs || 1)) * 100))}%`;
  return {
    type: "box",
    layout: "horizontal",
    alignItems: "center",
    spacing: "sm",
    height: "24px",
    contents: [
      fixedBox(nameWidth, [{ type: "text", text: name, size: "sm", weight: "bold", wrap: false }]),
      {
        type: "box",
        layout: "horizontal",
        flex: 1,
        alignItems: "center",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            flex: 1,
            justifyContent: "flex-end",
            contents: score < 0 ? [bar(width, COLORS.loseBar, "3px")] : [],
          },
          { type: "box", layout: "vertical", width: "1px", height: "16px", backgroundColor: COLORS.axis, contents: [] },
          {
            type: "box",
            layout: "horizontal",
            flex: 1,
            contents: score > 0 ? [bar(width, COLORS.winBar, "3px")] : [],
          },
        ],
      },
      fixedBox("64px", [{
        type: "text",
        text: formatScore(score),
        size: "sm",
        weight: "bold",
        align: "end",
        color: scoreColor(score),
      }]),
    ],
  };
}

// 場地費：只顯示累積金額
export function feeRow(fee, right) {
  return {
    type: "box",
    layout: "horizontal",
    alignItems: "center",
    backgroundColor: COLORS.feeBg,
    cornerRadius: "8px",
    paddingAll: "8px",
    paddingStart: "10px",
    paddingEnd: "10px",
    contents: [
      {
        type: "text",
        flex: 1,
        size: "sm",
        wrap: true,
        contents: [
          { type: "span", text: fee.name, weight: "bold", color: COLORS.feeText },
          { type: "span", text: " · 場地費", color: COLORS.feeSub },
        ],
      },
      {
        type: "text",
        flex: 0,
        size: "sm",
        align: "end",
        contents: right || [
          { type: "span", text: "累積 ", color: COLORS.feeSub },
          { type: "span", text: fee.totalScore.toLocaleString("en-US"), weight: "bold", color: COLORS.feeText },
        ],
      },
    ],
  };
}

export function note(text) {
  return { type: "text", text, size: "xxs", color: COLORS.muted, wrap: true, margin: "sm" };
}

// 按鈕用 box 畫，才能控制高度、圓角與外框
export function primaryButton(label, action) {
  return {
    type: "box",
    layout: "vertical",
    flex: 1,
    height: "44px",
    cornerRadius: "10px",
    backgroundColor: COLORS.felt,
    justifyContent: "center",
    action,
    contents: [{ type: "text", text: label, color: "#FFFFFF", weight: "bold", align: "center" }],
  };
}

export function outlineButton(label, action, width) {
  return {
    type: "box",
    layout: "vertical",
    ...(width ? { width } : { flex: 1 }),
    height: "44px",
    cornerRadius: "10px",
    borderWidth: "1px",
    borderColor: COLORS.border,
    justifyContent: "center",
    action,
    contents: [{ type: "text", text: label, color: COLORS.felt, weight: "bold", size: "sm", align: "center" }],
  };
}

export function gearButton(action) {
  return {
    type: "box",
    layout: "vertical",
    width: "44px",
    height: "44px",
    cornerRadius: "10px",
    borderWidth: "1px",
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    action,
    contents: [
      APP_URL
        ? { type: "image", url: `${APP_URL}/icons/gear.png`, size: "20px", aspectRatio: "1:1" }
        : { type: "text", text: "設定", size: "xs", color: COLORS.felt, align: "center" },
    ],
  };
}

export function footer(contents) {
  return {
    type: "box",
    layout: "horizontal",
    spacing: "sm",
    paddingTop: "12px",
    paddingBottom: "16px",
    paddingStart: "16px",
    paddingEnd: "16px",
    contents,
  };
}
