import { TextField, Button } from "@mui/material";
import styled from "styled-components";
import { useState, useMemo } from "react";
import useSWR from "swr";
import useLiff from "@/hooks/useLiff";
import Head from "next/head";
import { createGame } from "@/lib/api/games";

const NewGameContainer = ({ room_id }) => {
  const { data, isLoading } = useSWR(
    room_id ? `/api/rooms/${room_id}/players` : null
  );
  const [playerScores, setPlayerScores] = useState({});
  const { sendMessage, closeWindow } = useLiff();

  const handleScoreChange = (playerId, score) => {
    setPlayerScores((prevScores) => ({
      ...prevScores,
      [playerId]: score,
    }));
  };

  const hasNonNumberScore = useMemo(() => {
    return Object.values(playerScores).some(score => {
      console.log('score');
      console.log(score);
      return isNaN(Number(score)) && score !== "";
    });
  }, [playerScores]);

  const totalScore = useMemo(() => {
    return Object.values(playerScores).reduce((sum, score) => sum + (Number(score) || 0), 0);
  }, [playerScores]);

  const handleSubmit = async () => {
    const records = Object.entries(playerScores).map(([playerId, score]) => ({
      player_id: Number(playerId),
      score: Number(score) || 0,
    }));

    try {
      await createGame(room_id, records)
      setPlayerScores({});
      await sendMessage("紀錄成功");
      await sendMessage("麻將");
      closeWindow();
    } catch (error) {
      console.error("Error submitting game:", error);
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
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
          <Button variant="contained" onClick={handleSubmit} disabled={hasNonNumberScore}>
            送出
          </Button>
        </div>
      </Container>
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

    span {
      padding-left: 12px;
    }
  }
`;

export default NewGameContainer;
