import NewGameContainer from '@/containers/NewGameContainer';

export async function getServerSideProps(context) {
  const { room_id } = context.params;
  
  return {
    props: { room_id: Number(room_id) },
  };
}

const PlayersPage = ({ room_id }) => {
  return <NewGameContainer room_id={room_id} />;
};

export default PlayersPage;
