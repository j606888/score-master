import { TextField, Button } from "@mui/material";
import styled from "styled-components";
import { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import useLiff from "@/hooks/useLiff";
import Head from "next/head";
import { createGame, syncDraft, deleteDraft } from "@/lib/api/games";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import Snackbar from '@mui/material/Snackbar';

const NewGameContainer = ({ room_id }) => {
  const { data, isLoading: isPlayersLoading } = useSWR(`/api/rooms/${room_id}/players`)
  const { data: draftData, isLoading: isDraftLoading } = useSWR(`/api/rooms/${room_id}/drafts`)
  const [playerScores, setPlayerScores] = useState({});
  const { sendMessage, closeWindow } = useLiff();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isLoading || isDraftLoading) return
    if (draftData) {
      setPlayerScores(draftData)
    }
  }, [draftData, isLoading, isDraftLoading]);

  const handleScoreChange = (playerId, score) => {
    setPlayerScores((prevScores) => ({
      ...prevScores,
      [playerId]: score,
    }));
  };

  useEffect(() => {
    const debouncedSync = debounce(async () => {
      if (playerScores === draftData) return
      await syncDraft(room_id, playerScores)
      setOpen(true)
    }, 1500);

    debouncedSync();

    return () => debouncedSync.cancel();
  }, [playerScores, room_id, draftData]);

  const debounce = (func, delay) => {
    let timeoutId;
    const debouncedFunc = (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
    debouncedFunc.cancel = () => clearTimeout(timeoutId);
    return debouncedFunc;
  };

  const hasNonNumberScore = useMemo(() => {
    return Object.values(playerScores).some(score => {
      return isNaN(Number(score)) && score !== "";
    });
  }, [playerScores]);

  const totalScore = useMemo(() => {
    return Object.values(playerScores).reduce((sum, score) => sum + (Number(score) || 0), 0);
  }, [playerScores]);

  const handleSubmit = async () => {
    if (totalScore !== 0) {
      const confirmMessage = `總分不為零 (${totalScore})，確定要提交嗎？`;
      if (!confirm(confirmMessage)) return
    }
    setIsLoading(true);
    const records = Object.entries(playerScores).map(([playerId, score]) => ({
      player_id: Number(playerId),
      score: Number(score) || 0,
    }));

    await createGame(room_id, records)
    await handleDeleteDraft()
    await sendMessage("紀錄成功");
    await sendMessage("麻將");
    closeWindow();
  }

  const handleDeleteDraft = async () => {
    await deleteDraft(room_id)
    setPlayerScores({})
  }

  if (isPlayersLoading || isDraftLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <Head>
        <title>新增紀錄</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <Container>
        <div className="player-list">
          {data?.players.map((player) => (
            <div className="player-item" key={player.id}>
              <div className="player-name">
                <span>{player.name}</span>
              </div>
              <TextField
                variant="outlined"
                type="number"
                size="small"
                value={playerScores[player.id] || ""}
                onChange={(e) => handleScoreChange(player.id, e.target.value)}
                error={playerScores[player.id] && isNaN(Number(playerScores[player.id]))}
              />
            </div>
          ))}
        </div>
        <div className="total-score">
          <span>
            總額: {totalScore}
          </span>
          <div className="button-group">
            <Button variant="outlined" onClick={handleDeleteDraft}>
              清空
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={hasNonNumberScore || isLoading}>
              送出
            </Button>
          </div>
        </div>
      </Container>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
        message="同步成功"
      />
    </>
  );
};

const Container = styled.div`
  padding: 12px;

  .player-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 64px;
  }

  .player-item {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .player-name {
    width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .total-score {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 12px;
    background-color: #eee;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .button-group {
      display: flex;
      gap: 12px;
    }

    span {
      padding-left: 12px;
    }
  }
`;

export default NewGameContainer;
