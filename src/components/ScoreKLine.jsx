import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { COLORS } from '@/components/PageHeader';
import { formatScore, gameDay } from '@/utils/format';

const PLOT_H = 168   // K 棒區高度
const AXIS_H = 20    // 下方日期列
const PAD_Y = 10
const PAD_X = 14     // 左右留白，頭尾的日期才不會被切掉
const SLOT_MIN = 20  // 每根 K 棒佔的寬度（含間距），也是點擊範圍
const SLOT_MAX = 36
const BODY_MAX = 14
const LABEL_GAP = 44 // 日期標籤之間至少隔多寬
const Y_AXIS_W = 44

// 依牌局日把這位玩家的累計分數切成 K 棒：開 = 當天第一局前的累計，收 = 最後一局後的累計
export function buildCandles(games, playerId) {
  const candles = []
  let total = 0

  // games 是新到舊，從最舊的開始累計
  for (const game of [...games].reverse()) {
    const record = game.records.find(record => record.player_id === playerId)
    if (!record) continue

    const day = gameDay(game.recorded_at)
    let candle = candles[candles.length - 1]
    if (candle?.key !== day.key) {
      candle = { ...day, open: total, high: total, low: total, close: total, count: 0 }
      candles.push(candle)
    }
    total += record.score
    candle.close = total
    candle.high = Math.max(candle.high, total)
    candle.low = Math.min(candle.low, total)
    candle.count += 1
  }
  return candles
}

// y 軸取整數刻度
function niceScale(values) {
  const lo = Math.min(...values)
  let hi = Math.max(...values)
  if (lo === hi) hi = lo + 100

  const raw = (hi - lo) / 4
  const pow = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 5, 10].find(n => n * pow >= raw) * pow
  const min = Math.floor(lo / step) * step
  const max = Math.ceil(hi / step) * step

  const ticks = []
  for (let value = min; value <= max; value += step) ticks.push(value)
  return { min, max, ticks }
}

// 刻度到萬就全部用「萬」，不混用
function tickFormatter(ticks) {
  const useWan = ticks.some(tick => Math.abs(tick) >= 10000)
  return (value) => {
    const sign = value < 0 ? '−' : ''
    const abs = Math.abs(value)
    if (useWan && abs > 0) return `${sign}${+(abs / 10000).toFixed(1)}萬`
    return sign + abs.toLocaleString('en-US')
  }
}

const crisp = (value) => Math.round(value) + 0.5

function ScoreKLine({ candles }) {
  const scrollRef = useRef(null)
  const [width, setWidth] = useState(0)
  const [scrollX, setScrollX] = useState(0)
  const [selected, setSelected] = useState(candles.length - 1)

  const n = candles.length
  const index = Math.min(selected, n - 1)
  const current = candles[index]
  const change = current.close - current.open

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(scrollRef.current)
    return () => observer.disconnect()
  }, [])

  // 一打開就捲到最右邊（最新的一天）
  useEffect(() => {
    const el = scrollRef.current
    el.scrollLeft = el.scrollWidth
    setScrollX(el.scrollLeft)
  }, [width, n])

  const slot = width ? Math.min(SLOT_MAX, Math.max(SLOT_MIN, (width - PAD_X * 2) / n)) : SLOT_MIN
  const plotW = Math.max(width, n * slot + PAD_X * 2)
  const offset = plotW - PAD_X - n * slot // 靠右對齊，最新的一天貼著 y 軸
  const bodyW = Math.min(BODY_MAX, Math.round(slot * 0.6))
  const labelEvery = Math.ceil(LABEL_GAP / slot)

  // 跟看盤軟體一樣，y 軸只依畫面上看得到的那幾天縮放，K 棒才不會被整段歷史壓扁
  const first = Math.max(0, Math.floor((scrollX - offset) / slot))
  const last = Math.min(n - 1, Math.ceil((scrollX + width - offset) / slot) - 1)
  const visible = candles.slice(first, Math.max(first, last) + 1)
  const { min, max, ticks } = niceScale(visible.flatMap(candle => [candle.high, candle.low]))
  const formatTick = tickFormatter(ticks)
  const y = (value) => PAD_Y + ((max - value) / (max - min)) * (PLOT_H - PAD_Y * 2)
  const x = (i) => offset + i * slot + slot / 2

  const onKeyDown = (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const next = Math.max(0, Math.min(n - 1, index + (e.key === 'ArrowLeft' ? -1 : 1)))
    setSelected(next)

    const el = scrollRef.current
    if (x(next) < el.scrollLeft + slot) el.scrollLeft = x(next) - slot
    if (x(next) > el.scrollLeft + el.clientWidth - slot) el.scrollLeft = x(next) - el.clientWidth + slot
  }

  return (
    <Card>
      <div className="readout" aria-live="polite">
        <div className="readout-head">
          <span className="day">{current.label}</span>
          <span className="count">{current.count} 局</span>
          <span className="change" style={{ color: change >= 0 ? COLORS.win : COLORS.lose }}>
            當日 {formatScore(change)}
          </span>
        </div>
        <dl className="ohlc">
          {[['開', current.open], ['高', current.high], ['低', current.low], ['收', current.close]].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{formatScore(value)}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="chart">
        <div
          className="scroll"
          ref={scrollRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onScroll={(e) => setScrollX(e.currentTarget.scrollLeft)}
          aria-label="累計分數 K 線，左右鍵切換日期"
        >
          {width > 0 && (
            <svg width={plotW} height={PLOT_H + AXIS_H}>
              {/* 內層 svg 會裁切，捲動中還沒重算刻度的 K 棒不會蓋到日期 */}
              <svg width={plotW} height={PLOT_H}>
                {ticks.map(tick => (
                  <line
                    key={tick}
                    x1={0}
                    x2={plotW}
                    y1={crisp(y(tick))}
                    y2={crisp(y(tick))}
                    stroke={tick === 0 ? COLORS.border : COLORS.line}
                  />
                ))}
                <line x1={crisp(x(index))} x2={crisp(x(index))} y1={0} y2={PLOT_H} stroke={COLORS.border} />

                {candles.map((candle, i) => {
                  const up = candle.close > candle.open
                  const down = candle.close < candle.open
                  const color = up ? COLORS.winBar : down ? COLORS.lose : COLORS.muted
                  const top = y(Math.max(candle.open, candle.close))
                  const height = y(Math.min(candle.open, candle.close)) - top
                  // 輸的那天畫空心，色弱也分得出輸贏；實體太扁就畫實心
                  const hollow = down && height >= 4
                  const left = Math.round(x(i) - bodyW / 2)
                  const solidH = Math.max(2, height)

                  return (
                    <g key={i}>
                      <line x1={crisp(x(i))} x2={crisp(x(i))} y1={y(candle.high)} y2={y(candle.low)} stroke={color} />
                      {hollow ? (
                        <rect x={left + 0.75} y={top + 0.75} width={bodyW - 1.5} height={height - 1.5} rx={1.5} fill="#fff" stroke={color} strokeWidth={1.5} />
                      ) : (
                        <rect x={left} y={top + (height - solidH) / 2} width={bodyW} height={solidH} rx={1.5} fill={color} />
                      )}
                    </g>
                  )
                })}
              </svg>

              {candles.map((candle, i) => (n - 1 - i) % labelEvery === 0 && (
                <text key={i} x={x(i)} y={PLOT_H + 14} textAnchor="middle" fontWeight={i === index ? 700 : 400}>
                  {candle.short}
                </text>
              ))}

              {candles.map((candle, i) => (
                <rect
                  key={i}
                  x={offset + i * slot}
                  y={0}
                  width={slot}
                  height={PLOT_H + AXIS_H}
                  fill="transparent"
                  onClick={() => setSelected(i)}
                  onPointerMove={(e) => e.pointerType === 'mouse' && setSelected(i)}
                />
              ))}
            </svg>
          )}
        </div>
        <svg className="y-axis" width={Y_AXIS_W} height={PLOT_H + AXIS_H} aria-hidden="true">
          {ticks.map(tick => (
            <text key={tick} x={6} y={y(tick)} dy="0.32em">{formatTick(tick)}</text>
          ))}
        </svg>
      </div>

      <p className="legend">
        <i className="key up" />當天贏
        <i className="key down" />當天輸
        <span>· 一根 K 棒一天，早上 6 點換日</span>
      </p>
    </Card>
  )
}

const Card = styled.section`
  background: #fff;
  border-radius: 12px;
  padding: 12px 14px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .readout-head {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 14px;
  }

  .day {
    font-weight: 700;
    color: ${COLORS.label};
  }

  .count {
    flex: 1;
    font-size: 12px;
    color: ${COLORS.muted};
  }

  .change {
    font-weight: 700;
  }

  .ohlc {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 4px;
    margin: 4px 0 0;

    div {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }

    dt {
      font-size: 11px;
      color: ${COLORS.muted};
    }

    dd {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
  }

  .chart {
    display: flex;
  }

  .scroll {
    flex: 1;
    min-width: 0;
    height: ${PLOT_H + AXIS_H}px;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    outline: none;
    border-radius: 4px;

    &::-webkit-scrollbar {
      display: none;
    }

    &:focus-visible {
      box-shadow: 0 0 0 2px ${COLORS.felt};
    }
  }

  svg {
    display: block;
  }

  text {
    font-size: 10px;
    fill: ${COLORS.muted};
    font-variant-numeric: tabular-nums;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 6px;
    margin: 0;
    font-size: 11px;
    color: ${COLORS.muted};
  }

  .key {
    display: inline-block;
    width: 8px;
    height: 11px;
    border-radius: 1.5px;
    box-sizing: border-box;

    &.up {
      background: ${COLORS.winBar};
    }

    &.down {
      margin-left: 4px;
      border: 1.5px solid ${COLORS.lose};
    }
  }
`;

export default ScoreKLine;
