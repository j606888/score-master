import { TextField, Button } from "@mui/material";
import styled from "styled-components";
import { useState } from "react";
import useSWR from 'swr';

const AddPlayerContainer = ({ room_id }) => {
  const [playerName, setPlayerName] = useState('');
  const fetcher = (url) => fetch(url).then((res) => res.json());

  const { data, isLoading, error, mutate } = useSWR(room_id ? `/api/rooms/${room_id}/players` : null, fetcher) ;

  const handleAddPlayer = async () => {
    const response = await fetch(`/api/rooms/${room_id}/players`, {
      method: 'POST',
      body: JSON.stringify({ name: playerName }),
    });
    const data = await response.json();
    console.log('Player added', data);
    setPlayerName('');
    mutate()
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <Container>
    <TextField label="Add Player"  variant='standard' value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
    <Button variant="contained" onClick={handleAddPlayer}>Add</Button>
    <p>Players</p>
    {data?.players.map(player => (
      <div key={player.id}>{player.name}</div>
    ))}
  </Container>;
};

const Container = styled.div`
  padding: 12px;
`

export default AddPlayerContainer;