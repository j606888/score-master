import { useState } from "react";
import {
    Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import styled from "styled-components";

const NewRecord = ({ players = [], onSubmit = () => {} }) => {
  const [playerId, setPlayerId] = useState(null);
  const [score, setScore] = useState('');

  function handleSubmit() {
    onSubmit(playerId, score);
    setPlayerId(null);
    setScore('');
  }

  return (
    <Container>
      <FormControl sx={{ minWidth: 160 }} size="small">
        <InputLabel>玩家</InputLabel>
        <Select
          label="玩家"
          value={playerId || ''}
          onChange={(e) => setPlayerId(e.target.value)}
        >
          {players.map((player) => (
            <MenuItem key={player.id} value={player.id}>
              {player.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        variant="outlined"
        type="number"
        size="small"
        value={score}
        label="金額"
        onChange={(e) => setScore(e.target.value)}
      />
      <Button variant="contained" onClick={handleSubmit} disabled={!playerId || !score}>
        新增
      </Button>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

export default NewRecord;
