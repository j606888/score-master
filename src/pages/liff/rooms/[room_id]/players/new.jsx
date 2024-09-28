import AddPlayerContainer from '@/containers/AddPlayerContainer';

export async function getServerSideProps(context) {
  const { room_id } = context.params;
  
  return {
    props: { room_id: Number(room_id) },
  };
}

const NewPlayerPage = ({ room_id }) => {
  return <AddPlayerContainer room_id={room_id} />;
};

export default NewPlayerPage;