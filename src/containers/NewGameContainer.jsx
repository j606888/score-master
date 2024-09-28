import { TextField, Button } from "@mui/material";
import styled from "styled-components";
import { useState } from "react";
import useSWR from 'swr';

const NewGameContainer = ({ room_id }) => {
  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data, isLoading, error, mutate } = useSWR(room_id ? `/api/rooms/${room_id}/players` : null, fetcher);
  const [playerScores, setPlayerScores] = useState({});

  const handleScoreChange = (playerId, score) => {
    setPlayerScores(prevScores => ({
      ...prevScores,
      [playerId]: score
    }));
  };

  const handleSubmit = async () => {
    // Prepare the data for the API call
    const records = Object.entries(playerScores).map(([playerId, score]) => ({
      player_id: Number(playerId),
      score: Number(score) || 0
    }));

    // Make the API call
    try {
      const response = await fetch(`/api/rooms/${room_id}/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit records');
      }

      const result = await response.json();
      console.log('Game submitted successfully:', result);

      // Clear the scores after successful submission
      setPlayerScores({});

      // Optionally, refresh the player data
      mutate();
    } catch (error) {
      console.error('Error submitting game:', error);
      // Handle the error (e.g., show an error message to the user)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <Container>
    <h2>新增紀錄</h2>
    <div className="player-list">
      {data?.players.map(player => (
        <div className="player-item" key={player.id}>
          <div className='player-name'><span>{player.name}</span></div>
          <TextField 
            variant='outlined' 
            type="number" 
            size='small'
            value={playerScores[player.id] || ''}
            onChange={(e) => handleScoreChange(player.id, e.target.value)}
          />
        </div>
      ))}
    </div>
    <div className='total-score'>
      Total: {Object.values(playerScores).reduce((sum, score) => sum + Number(score || 0), 0)}
      <Button variant='contained' onClick={handleSubmit}>送出</Button>
    </div>
  </Container>;
};

const Container = styled.div`
  padding: 12px;

  h2 {
    margin-bottom: 12px;
  }

  .player-list {
    max-width: 480px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 40px;
  }

  .player-item {
    display: flex;
    align-items: center;
  }

  .player-name {
    padding-left: 12px;
    width: 100px;
  }

  .total-score {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 12px;
    background-color: #ccc;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

`

export default NewGameContainer;