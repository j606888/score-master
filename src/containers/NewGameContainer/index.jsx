import { TextField, Button, Checkbox, FormGroup, FormControlLabel, Divider, IconButton } from "@mui/material";

import styled from "styled-components";
import { useState, useMemo, useEffect, useCallback } from "react";
import useSWR from "swr";
import useLiff from "@/hooks/useLiff";
import Head from "next/head";
import { createGame, createDraft, deleteAllDraft, deleteDraft } from "@/lib/api/games";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import NewRecord from "./NewRecord";
import DeleteIcon from '@mui/icons-material/Delete';

const NewGameContainer = ({ room_id }) => {
  const { data, isLoading: isPlayersLoading } = useSWR(`/api/rooms/${room_id}/players`)
  const { data: draftData, isLoading: isDraftLoading, mutate: mutateDraft } = useSWR(`/api/rooms/${room_id}/drafts`)
  const { sendMessage, closeWindow } = useLiff();
  const [isLoading, setIsLoading] = useState(false);
  const [forceSubmit, setForceSubmit] = useState(false);

  useEffect(() => {
    if (isLoading || isDraftLoading) return

  }, [draftData, isLoading, isDraftLoading]);

  const createDraftRecord = useCallback(async(playerId, score) => {
    const draftScore = score === "" ? null : Number(score); // Use null to delete the draft
    await createDraft(room_id, playerId, draftScore);
    
  }, [room_id]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      await mutateDraft();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [mutateDraft]);

  const totalScore = useMemo(() => {
    if (!draftData) return 0
    return draftData.reduce((sum, draft) => sum + (Number(draft.score) || 0), 0);
  }, [draftData]);

  const handleSubmit = async () => {
    if (totalScore !== 0) {
      const confirmMessage = `總分不為零 (${totalScore})，確定要提交嗎？`;
      if (!confirm(confirmMessage)) return
    }
    setIsLoading(true);
    const records = draftData.reduce((acc, draft) => {
      const existingRecord = acc.find(record => record.player_id === draft.player_id);
      if (existingRecord) {
        existingRecord.score += Number(draft.score) || 0;
      } else {
        acc.push({
          player_id: draft.player_id,
          score: Number(draft.score) || 0
        });
      }
      return acc;
    }, []);

    await createGame(room_id, records)
    await handleDeleteAllDraft()
    await sendMessage("紀錄成功");
    await sendMessage("麻將");
    closeWindow();
  }

  const handleDeleteAllDraft = async () => {
    await deleteAllDraft(room_id)
    await mutateDraft()
  }

  const handleNewRecord = async (playerId, score) => {
    await createDraftRecord(playerId, score)
    await mutateDraft()
  }

  const handleDeleteDraft = async (id) => {
    await deleteDraft(room_id, id)
    await mutateDraft()
  }

  if (isPlayersLoading || isDraftLoading) {
    return <LoadingSkeleton />;
  }

  const canSubmit = (forceSubmit || totalScore === 0) && !isLoading && draftData?.length > 0

  return (
    <>
      <Head>
        <title>新增紀錄</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <Container>
        <div className="calculator-link">
          <span className='new-feature'>New</span>
          <Button
            variant="outlined"
            onClick={() => window.location.href = `/liff/rooms/${room_id}/calculator?from=${window.location.pathname}`}
          >
            籌碼計算機
          </Button>
        </div>
        
        <div className="player-list">
          <NewRecord players={data?.players} onSubmit={handleNewRecord} />
          <Divider  />
          {draftData?.map(draft => (
            <div className="player-item" key={draft.id}>
              <div className="player-name">
                <span>{data?.players.find(player => player.id === draft.player_id).name}</span>
              </div>
              <TextField
                variant="outlined"
                type="number"
                size="small"
                value={draft.score}
                disabled
              />
              <IconButton onClick={() => handleDeleteDraft(draft.id)}>
                <DeleteIcon />
              </IconButton>
            </div>
          ))}
          <div className="player-item">
            <FormGroup>
              <FormControlLabel control={<Checkbox checked={forceSubmit} onChange={() => setForceSubmit(!forceSubmit)} />} label="已確認總額不為零(先閃人的別按🤢)" />
            </FormGroup>
          </div>
        </div>
        <div className="total-score">
          <span>
            總額: {totalScore}
          </span>
          <div className="button-group">
            <Button variant="outlined" onClick={handleDeleteAllDraft}>
              清空
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit}>
              送出
            </Button>
          </div>
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
    gap: 12px;
    margin-bottom: 64px;
  }

  .player-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .player-name {
    width: 80px;
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

  .calculator-link {
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 12px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .new-feature {
    background: #E74C3C;
    color: #fff;
    padding: 4px 8px;
    border-radius: 12px;
    margin-right: 8px;
    font-size: 12px;
    font-weight: bold;
  }
`;

export default NewGameContainer;
