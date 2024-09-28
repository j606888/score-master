import { TextField, Button, Chip } from "@mui/material"
import styled from "styled-components"
import { useState } from "react"
import useSWR from "swr"
import FaceIcon from "@mui/icons-material/Face"
import Head from "next/head"
import { addPlayer } from "@/lib/api/players"
import LoadingSkeleton from "@/components/LoadingSkeleton"

const AddPlayerContainer = ({ room_id }) => {
  const [playerName, setPlayerName] = useState("")
  const [loading, setLoading] = useState(false)
  const { data, isLoading, mutate } = useSWR(
    room_id ? `/api/rooms/${room_id}/players` : null
  )

  const handleAddPlayer = async () => {
    setLoading(true)
    await addPlayer(room_id, { name: playerName })
    setPlayerName("")
    mutate()
    setLoading(false)
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <>
      <Head>
        <title>十一萬</title>
      </Head>
      <Container>
        <div className="add-new-player">
          <TextField
            label="新增玩家"
            variant="standard"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleAddPlayer}
            size="small"
            disabled={loading}
            loading={loading}
          >
            建立
          </Button>
        </div>
        <div className="player-list">
          {data?.players.map((player) => (
            <Chip
              icon={<FaceIcon />}
              key={player.id}
              label={player.name}
              variant="outlined"
            />
          ))}
        </div>
      </Container>
      
    </>
  )
}

const Container = styled.div`
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0 auto;
  max-width: 600px;

  .add-new-player {
    margin-bottom: 16px;
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: center;
  }

  .player-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
  }
`;

export default AddPlayerContainer;
