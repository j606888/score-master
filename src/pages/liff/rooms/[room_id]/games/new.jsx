import NewGameContainer from '@/containers/NewGameContainer';

export async function getServerSideProps(context) {
  const { room_id } = context.params;
  
  return {
    props: { room_id: Number(room_id) },
  };
}

const NewGamePage = ({ room_id }) => {
  return <NewGameContainer room_id={room_id} />;
};

export default NewGamePage;