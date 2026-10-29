import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import PageHeader, { COLORS } from '@/components/PageHeader';
import ScoreKLine, { buildCandles } from '@/components/ScoreKLine';
import { formatScore, formatGameTime } from '@/utils/format';

function GamesTableContainer({ room_id }) {
  const { data, isLoading } = useSWR(`/api/rooms/${room_id}/games`)
  const { data: settings } = useSWR(`/api/rooms/${room_id}/settings`)
  const router = useRouter()
  // 從戰績選單點名字進來會帶 ?player=
  const [selectedPlayer, setSelectedPlayer] = useState(() => Number(router.query.player) || null)

  const games = useMemo(() => data?.games || [], [data])

  // 篩選列：一般玩家，依出場次數排序
  const filterPlayers = useMemo(() => {
    const counts = new Map()
    games.forEach(game => game.records.forEach(record => {
      if (record.fee) return
      const current = counts.get(record.player_id) || { id: record.player_id, name: record.name, count: 0 }
      counts.set(record.player_id, { ...current, count: current.count + 1 })
    }))
    return [...counts.values()].sort((a, b) => b.count - a.count)
  }, [games])

  const filter = filterPlayers.some(player => player.id === selectedPlayer) ? selectedPlayer : null
  const candles = useMemo(() => (filter ? buildCandles(games, filter) : []), [games, filter])

  if (isLoading) return <LoadingSkeleton />

  const numbered = games.map((game, index) => ({ ...game, no: games.length - index }))
  const shown = filter
    ? numbered.filter(game => game.records.some(record => record.player_id === filter))
    : numbered

  const filterTotal = filter
    ? shown.reduce((sum, game) => sum + game.records.find(record => record.player_id === filter).score, 0)
    : null

  return (
    <>
      <Head>
        <title>歷史紀錄</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <Container>
        <PageHeader subtitle={`${settings?.name ?? ''} · 共 ${games.length} 局`} title="歷史紀錄">
          <div className="filters">
            <button type="button" className={!filter ? 'on' : ''} onClick={() => setSelectedPlayer(null)}>全部</button>
            {filterPlayers.map(player => (
              <button
                type="button"
                key={player.id}
                className={filter === player.id ? 'on' : ''}
                onClick={() => setSelectedPlayer(player.id)}
              >
                {player.name}
              </button>
            ))}
          </div>
        </PageHeader>

        <main>
          {filter && (
            <p className="filter-summary">
              {filterPlayers.find(player => player.id === filter)?.name} 出場 {shown.length} 局，合計
              <b style={{ color: filterTotal >= 0 ? COLORS.win : COLORS.lose }}> {formatScore(filterTotal)}</b>
            </p>
          )}
          {candles.length > 0 && <ScoreKLine key={filter} candles={candles} />}
          {shown.length === 0 && <p className="empty">還沒有任何紀錄</p>}
          {shown.map(game => (
            <article key={game.id} className="game">
              <div className="game-head">
                <span className="date">{formatGameTime(game.recorded_at)}</span>
                <span>第 {game.no} 局</span>
              </div>
              <div className="records">
                {game.records.map(record => (
                  <div
                    key={record.player_id}
                    className={`record ${record.fee ? 'fee' : ''} ${record.player_id === filter ? 'highlight' : ''}`}
                  >
                    <span className="name">{record.fee ? `${record.name}（場地費）` : record.name}</span>
                    <span
                      className="score"
                      style={{ color: record.fee ? COLORS.feeSub : record.score >= 0 ? COLORS.win : COLORS.lose }}
                    >
                      {formatScore(record.score)}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </main>
      </Container>
    </>
  );
}

const Container = styled.div`
  min-height: 100vh;
  background: ${COLORS.ground};
  color: ${COLORS.text};
  font-family: -apple-system, "PingFang TC", "Noto Sans TC", sans-serif;

  header {
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .filters {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    margin: 0 -16px;
    padding: 0 16px;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    button {
      flex-shrink: 0;
      height: 32px;
      padding: 0 12px;
      border-radius: 999px;
      border: 0;
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      background: rgba(255, 255, 255, 0.14);
      color: #fff;

      &.on {
        background: #fff;
        color: ${COLORS.felt};
      }
    }
  }

  main {
    padding: 12px 16px 32px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 640px;
    margin: 0 auto;
  }

  .filter-summary,
  .empty {
    font-size: 13px;
    color: ${COLORS.label};
    padding: 0 2px;
  }

  .game {
    background: #fff;
    border-radius: 12px;
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .game-head {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: ${COLORS.muted};
    padding-bottom: 2px;

    .date {
      flex: 1;
      font-weight: 700;
      color: ${COLORS.label};
    }
  }

  .records {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 16px;
    row-gap: 2px;
  }

  .record {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 24px;
    font-size: 14px;
    border-radius: 4px;

    &.fee .name {
      color: ${COLORS.feeSub};
    }

    &.highlight {
      background: #fbf1dc;
      margin: 0 -4px;
      padding: 0 4px;
    }
  }

  .name {
    flex: 1;
    min-width: 0;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .score {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
`;

export default GamesTableContainer;
