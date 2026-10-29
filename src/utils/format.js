const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"]

// +1,200 / −900 / 0
export function formatScore(n) {
  const value = Number(n) || 0
  const sign = value > 0 ? "+" : value < 0 ? "−" : ""
  return sign + Math.abs(value).toLocaleString("en-US")
}

// 10/29 週四 23:42（台灣時間，沒有日光節約，直接 +8 小時）
export function formatGameTime(date) {
  const d = new Date(new Date(date).getTime() + 8 * 60 * 60 * 1000)
  const pad = (n) => String(n).padStart(2, "0")
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()} 週${WEEKDAYS[d.getUTCDay()]} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}
