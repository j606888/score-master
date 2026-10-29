import React from 'react'
import GameTableContainer from '@/containers/GameTableContainer';
import { getRoomPageProps } from "@/lib/roomAccess";

export async function getServerSideProps(context) {
  return getRoomPageProps(context);
}

const GameTablePage = ({ room_id }) => {
  return <GameTableContainer room_id={room_id} />;
}

export default GameTablePage