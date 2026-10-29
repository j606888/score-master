import styled from "styled-components";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import useSWR from "swr";
import useLiff from "@/hooks/useLiff";
import Head from "next/head";
import { createGame, setDraft, deleteAllDraft } from "@/lib/api/games";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import PageHeader, { COLORS } from "@/components/PageHeader";
import { isFee } from "@/lib/playerRole";
import { formatScore } from "@/utils/format";
import ScoreRow from "./ScoreRow";

// entries: { [player_id]: { sign: 1 | -1 | null, amount: "300" } }
// 場地費的 sign 固定是 1
const toScore = (entry) => {
  if (!entry || entry.amount === "") return null;
  const amount = Number(entry.amount);
  if (amount === 0) return 0;
  return entry.sign ? entry.sign * amount : null;
};

const fromScore = (score, prev) => ({
  sign: score > 0 ? 1 : score < 0 ? -1 : prev?.sign ?? null,
  amount: String(Math.abs(score)),
});

const NewGameContainer = ({ room_id }) => {
  const { data, isLoading: isPlayersLoading } = useSWR(`/api/rooms/${room_id}/players`)
  const { data: settings } = useSWR(`/api/rooms/${room_id}/settings`)
  const { data: draftData, isLoading: isDraftLoading, mutate: mutateDraft } = useSWR(`/api/rooms/${room_id}/drafts`)
  const { sendMessage, closeWindow } = useLiff();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [entries, setEntries] = useState({});
  // 正在輸入或還沒存到伺服器的玩家，同步時不要蓋掉
  const focusedRef = useRef(null);
  const dirtyRef = useRef({});
  const pendingSavesRef = useRef(new Set());

  const players = useMemo(() => data?.players || [], [data]);
  const normalPlayers = useMemo(() => players.filter(player => !isFee(player)), [players]);
  const feePlayers = useMemo(() => players.filter(isFee), [players]);

  // 草稿可能有多筆（籌碼計算機是累加的），加總成每人一個分數
  const serverScores = useMemo(() => {
    const scores = new Map();
    draftData?.forEach(draft => {
      scores.set(draft.player_id, (scores.get(draft.player_id) || 0) + (Number(draft.score) || 0));
    });
    return scores;
  }, [draftData]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      await mutateDraft();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [mutateDraft]);

  // 預設勾選：有草稿的人，沒有草稿就用上一局的人
  useEffect(() => {
    if (!data || !draftData) return;
    const normalIds = new Set(normalPlayers.map(player => player.id));
    // 剛取消勾選、刪除還沒完成的人不要再加回來
    const draftIds = [...serverScores.keys()].filter(id => normalIds.has(id) && !dirtyRef.current[id]);

    setSelected(prev => {
      if (prev) {
        const missing = draftIds.filter(id => !prev.includes(id));
        return missing.length ? [...prev, ...missing] : prev;
      }
      if (draftIds.length) return draftIds;
      return (data.last_game_player_ids || []).filter(id => normalIds.has(id));
    });
  }, [data, draftData, normalPlayers, serverScores]);

  useEffect(() => {
    if (!draftData) return;
    setEntries(prev => {
      const next = { ...prev };
      const ids = new Set([...Object.keys(prev).map(Number), ...serverScores.keys()]);
      ids.forEach(id => {
        if (focusedRef.current === id || dirtyRef.current[id]) return;
        if (serverScores.has(id)) {
          next[id] = fromScore(serverScores.get(id), prev[id]);
        } else if (prev[id]?.amount) {
          // 別支手機刪掉了
          next[id] = { ...prev[id], amount: "" };
        }
      });
      return next;
    });
  }, [draftData, serverScores]);

  const saveEntry = useCallback(async (playerId, entry) => {
    const version = (dirtyRef.current[playerId] || 0) + 1;
    dirtyRef.current[playerId] = version;
    const request = setDraft(room_id, playerId, toScore(entry));
    pendingSavesRef.current.add(request);
    try {
      await request;
    } finally {
      pendingSavesRef.current.delete(request);
      if (dirtyRef.current[playerId] === version) delete dirtyRef.current[playerId];
    }
    mutateDraft();
  }, [room_id, mutateDraft]);

  const updateEntry = (playerId, patch, { save = false } = {}) => {
    const entry = { sign: null, amount: "", ...entries[playerId], ...patch };
    setEntries(prev => ({ ...prev, [playerId]: entry }));
    dirtyRef.current[playerId] = dirtyRef.current[playerId] || 1;
    if (save) saveEntry(playerId, entry);
  };

  const handleFocus = (playerId) => {
    focusedRef.current = playerId;
  };

  const handleBlur = (playerId) => {
    focusedRef.current = null;
    saveEntry(playerId, entries[playerId]);
  };

  const togglePlayer = (playerId) => {
    if (selected.includes(playerId)) {
      setSelected(selected.filter(id => id !== playerId));
      setEntries(prev => ({ ...prev, [playerId]: { sign: null, amount: "" } }));
      saveEntry(playerId, null);
    } else {
      setSelected([...selected, playerId]);
    }
  };

  const summary = useMemo(() => {
    let win = 0, lose = 0, fee = 0, missing = 0;
    (selected || []).forEach(id => {
      const score = toScore(entries[id]);
      if (score === null) missing += 1;
      else if (score > 0) win += score;
      else lose += score;
    });
    feePlayers.forEach(player => {
      fee += toScore(entries[player.id]) || 0;
    });
    return { win, lose, fee, missing, total: win + lose + fee };
  }, [selected, entries, feePlayers]);

  const handleSubmit = async () => {
    const records = [
      ...selected.map(id => ({ player_id: id, score: toScore(entries[id]) })),
      ...feePlayers
        .map(player => ({ player_id: player.id, score: toScore(entries[player.id]) }))
        .filter(record => record.score > 0),
    ];

    if (summary.total !== 0) {
      const confirmMessage = `總額不為零 (${formatScore(summary.total)})，確定要送出嗎？`;
      if (!confirm(confirmMessage)) return
    }
    setIsLoading(true);
    setError("");
    try {
      await createGame(room_id, records)
    } catch (e) {
      setError(e?.response?.data?.error || "送出失敗，請再試一次");
      setIsLoading(false);
      return
    }

    // 這局已經存好了，後面失敗也不能讓人再送一次
    dirtyRef.current = {};
    setEntries({});
    setSelected([]);
    try {
      // 等輸入框失焦時的存檔跑完再清，不然會留下草稿
      await Promise.allSettled([...pendingSavesRef.current])
      await deleteAllDraft(room_id)
      await sendMessage("紀錄成功");
      closeWindow();
    } catch (e) {
      setError("已記錄，但 LINE 訊息沒送出，可以在聊天室打關鍵字查看");
    } finally {
      setIsLoading(false);
      mutateDraft();
    }
  }

  const handleClear = async () => {
    dirtyRef.current = {};
    setEntries({});
    setSelected([]);
    await deleteAllDraft(room_id)
    await mutateDraft()
  }

  if (isPlayersLoading || isDraftLoading || !selected) {
    return <LoadingSkeleton />;
  }

  const selectedPlayers = selected
    .map(id => normalPlayers.find(player => player.id === id))
    .filter(Boolean);
  const balanced = summary.total === 0;
  const canSubmit = !isLoading && summary.missing === 0 && selectedPlayers.length > 0;

  let status = { text: "總額平衡，可以送出", color: COLORS.win };
  if (selectedPlayers.length === 0) status = { text: "先選這局有打的人", color: COLORS.muted };
  else if (summary.missing > 0) status = { text: `還有 ${summary.missing} 人沒填完`, color: COLORS.muted };
  else if (!balanced) status = { text: `總額差 ${formatScore(summary.total)}`, color: COLORS.lose };

  return (
    <>
      <Head>
        <title>記一局</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <Container>
        <PageHeader subtitle={settings?.name} title="記一局">
          <span className="sync"><span className="dot" />自動同步</span>
        </PageHeader>

        <main>
          <section className="card">
            <div className="card-title">
              <span>這局誰有打？</span>
              <span className="hint">已選 {selectedPlayers.length} 人</span>
            </div>
            <div className="chips">
              {normalPlayers.map(player => {
                const on = selected.includes(player.id);
                return (
                  <button
                    type="button"
                    key={player.id}
                    className={`chip ${on ? "on" : ""}`}
                    aria-pressed={on}
                    onClick={() => togglePlayer(player.id)}
                  >
                    {player.name}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="section-label">
            <span>輸入輸贏金額</span>
            <a href={`/liff/rooms/${room_id}/calculator`}>籌碼計算機 ›</a>
          </div>

          {selectedPlayers.map(player => (
            <ScoreRow
              key={player.id}
              name={player.name}
              entry={entries[player.id]}
              onSign={(sign) => updateEntry(player.id, { sign }, { save: true })}
              onAmount={(amount) => updateEntry(player.id, { amount })}
              onFocus={() => handleFocus(player.id)}
              onBlur={() => handleBlur(player.id)}
            />
          ))}

          {feePlayers.map(player => (
            <ScoreRow
              key={player.id}
              fee
              name={player.name}
              entry={entries[player.id]}
              onAmount={(amount) => updateEntry(player.id, { sign: 1, amount })}
              onFocus={() => handleFocus(player.id)}
              onBlur={() => handleBlur(player.id)}
            />
          ))}
        </main>

        <footer>
          <div className="summary">
            <div className="summary-text">
              <span className="breakdown">
                贏 {formatScore(summary.win)}
                {feePlayers.length > 0 && `　場地費 ${formatScore(summary.fee)}`}
                　輸 {formatScore(summary.lose)}
              </span>
              <span className="status" style={{ color: status.color }}>{error || status.text}</span>
            </div>
            <div className={`total ${balanced ? "ok" : "off"}`}>{formatScore(summary.total)}</div>
          </div>
          <div className="actions">
            <button type="button" className="clear" onClick={handleClear} disabled={isLoading}>清空</button>
            <button type="button" className="submit" onClick={handleSubmit} disabled={!canSubmit}>
              {isLoading ? "送出中…" : balanced ? "送出這局" : "總額不為零，仍要送出"}
            </button>
          </div>
        </footer>
      </Container>
    </>
  );
};

const Container = styled.div`
  min-height: 100vh;
  background: ${COLORS.ground};
  color: ${COLORS.text};
  font-family: -apple-system, "PingFang TC", "Noto Sans TC", sans-serif;

  header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .sync {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.14);
    font-size: 12px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #7ee0a8;
  }

  main {
    padding: 12px 16px calc(170px + env(safe-area-inset-bottom));
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .card {
    background: #fff;
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .card-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    font-weight: 700;

    .hint {
      font-size: 12px;
      font-weight: 400;
      color: ${COLORS.muted};
    }
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .chip {
    height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 600;
    border: 1px solid ${COLORS.border};
    background: #fff;
    color: ${COLORS.label};

    &.on {
      background: ${COLORS.felt};
      border-color: ${COLORS.felt};
      color: #fff;
    }
  }

  .section-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    color: ${COLORS.label};
    padding: 2px 2px 0;

    a {
      font-weight: 700;
      color: ${COLORS.felt};
    }
  }

  footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    border-top: 1px solid #dde3e0;
    padding: 14px 16px calc(20px + env(safe-area-inset-bottom));
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .summary-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .breakdown {
    font-size: 12px;
    color: ${COLORS.muted};
  }

  .status {
    font-size: 15px;
    font-weight: 700;
  }

  .total {
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 20px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;

    &.ok {
      background: ${COLORS.winBg};
      color: ${COLORS.win};
    }

    &.off {
      background: ${COLORS.loseBg};
      color: ${COLORS.lose};
    }
  }

  .actions {
    display: flex;
    gap: 10px;

    button {
      height: 50px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 700;
    }

    .clear {
      width: 96px;
      border: 1px solid ${COLORS.border};
      background: #fff;
      color: ${COLORS.text};
      font-weight: 600;
    }

    .submit {
      flex: 1;
      border: 0;
      background: ${COLORS.felt};
      color: #fff;
      font-size: 16px;

      &:disabled {
        opacity: 0.4;
      }
    }
  }
`;

export default NewGameContainer;
