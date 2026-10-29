import AddPlayerContainer from '@/containers/AddPlayerContainer';
import { getRoomPageProps } from "@/lib/roomAccess";

export async function getServerSideProps(context) {
  return getRoomPageProps(context);
}

const NewPlayerPage = ({ room_id }) => {
  return <AddPlayerContainer room_id={room_id} />;
};

export default NewPlayerPage;