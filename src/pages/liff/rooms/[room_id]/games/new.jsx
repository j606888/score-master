import NewGameContainer from '@/containers/NewGameContainer';
import { getRoomPageProps } from "@/lib/roomAccess";

export async function getServerSideProps(context) {
  return getRoomPageProps(context);
}

const NewGamePage = ({ room_id }) => {
  return <NewGameContainer room_id={room_id} />;
};

export default NewGamePage;