import React, { useState } from "react";
import Head from "next/head";
import styled from "styled-components";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckIcon from "@mui/icons-material/Check";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import useSWR from 'swr';
import { createRoom, updateActiveRoom } from "@/lib/api/rooms";

export async function getServerSideProps(context) {
  const { room_id } = context.params;
  return {
    props: { room_id: Number(room_id) },
  };
}

const SelectPage = ({ room_id }) => {
	const [open, setOpen] = useState(false);
	const [roomName, setRoomName] = useState("");
	const { data: rooms, isLoading, mutate } = useSWR(`/api/rooms/${room_id}`)

	const handleCreateRoom = async () => {
		await createRoom(room_id, roomName);
		setOpen(false);
		mutate()
	}

	const handleUpdateActiveRoom = async (new_room_id) => {
		await updateActiveRoom(room_id, new_room_id);
		mutate()
	}

	if (isLoading) return <div>Loading...</div>


  return (
    <>
      <Head>
        <title>選擇房間</title>
      </Head>
      <Container>
        <div className="header">
          <h1>Select Room</h1>
          <button onClick={() => setOpen(true)}>
            <AddCircleOutlineIcon sx={{ fontSize: 18 }} />
            <span>Create New Room</span>
          </button>
        </div>
        <div className="rooms">
          {rooms.map((room) => (
            <div className={`room ${room?.active ? "active" : ""}`} key={room.id} onClick={() => handleUpdateActiveRoom(room.id)}>
              <div className="room-header">
                <h2>{room.name}</h2>
                {room?.active && <CheckIcon sx={{ fontSize: 16 }} />}
              </div>
              <p className="room-created-at">Created at: {room.created_at?.split('T')[0]}</p>
            </div>
          ))}
        </div>
				<a className="back-to-settings" href={`/liff/rooms/${room_id}/settings`}>Back to Settings</a>
      </Container>
			<Dialog open={open} onClose={() => {}} PaperProps={{ sx: { minWidth: 400 } }}>
				<DialogTitle>Create New Room</DialogTitle>
				<DialogContent sx={{ padding: 2}}>
					<TextField label="Room Name" fullWidth value={roomName} onChange={(e) => setRoomName(e.target.value)} />
				</DialogContent>
				<DialogActions>
					<Button onClick={() => {}} className="dialog-button">Cancel</Button>
					<Button variant="contained" onClick={handleCreateRoom} className="dialog-button">Create</Button>
				</DialogActions>
			</Dialog>
    </>
  );
};

const Container = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;

  .header {
    display: flex;
		flex-direction: column;
		margin-bottom: 12px;
		gap: 8px;

		h1 {
			font-size: 24px;
			font-weight: 600;
			margin-bottom: 12px;
		}

    button {
      display: flex;
      align-items: center;
			justify-content: center;
      gap: 8px;
			text-align: center;
      padding: 12px 18px;
      border-radius: 6px;
      border: none;
      background-color: #000;
      color: #fff;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;

      &:hover {
        background-color: #333;
      }
    }
  }

  .rooms {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .room {
		display: flex;
		flex-direction: column;
		gap: 8px;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #e3e3e3;

    &.active {
      border-color: #000;
			background-color: #f3f3f3;
    }

		&:hover {
			cursor: pointer;
			border: 1px solid #000;
			transition: all 0.3s ease;
		}
  }

	.room-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;

		h2 {
			font-size: 16px;
			font-weight: 600;
		}
	}

	.room-created-at {
		font-size: 12px;
		color: #666;
	}

	.back-to-settings {
		border: 1px solid #e3e3e3;
		border-radius: 6px;
		padding: 12px 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		text-decoration: none;
		color: #000;
		font-size: 14px;
		font-weight: 600;
		margin-top: 12px;
	}
`;

export default SelectPage;
