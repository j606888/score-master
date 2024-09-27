import { useRouter } from "next/router";
import { TextField, Button } from "@mui/material";
import styled from "styled-components";
import { useState } from "react";
import useSWR from 'swr';

const Players = () => {
  const router = useRouter();
  const { room_id } = router.query;
  const [playerName, setPlayerName] = useState('');
  console.log({ room_id })

  const fetcher = (url) => fetch(url).then((res) => res.json());

  const { data, isLoading, error } = useSWR(room_id ? `/api/rooms/${room_id}/players` : null, fetcher) ;

  console.log({ data, isLoading, error })
  const handleAddPlayer = async () => {
    const response = await fetch(`/api/rooms/${room_id}/players`, {
      method: 'POST',
      body: JSON.stringify({ name: playerName }),
    });
    const data = await response.json();
    console.log('Player added', data);
    setPlayerName('');
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

export default Players;