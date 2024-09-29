import React from 'react'
import GameTableContainer from '@/containers/GameTableContainer';

export async function getServerSideProps(context) {
  const { room_id } = context.params
  
  return {
    props: { room_id: Number(room_id) },
  }
}

const GameTablePage = ({ room_id }) => {
  return <GameTableContainer room_id={room_id} />;
}

export default GameTablePage