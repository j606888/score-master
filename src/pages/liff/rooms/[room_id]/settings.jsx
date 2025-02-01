import styled from "styled-components";
import Head from "next/head";

export async function getServerSideProps(context) {
  const { room_id } = context.params;
  return {
    props: { room_id: Number(room_id) },
  };
}

const SettingsPage = ({ room_id }) => {
  return (
  <>
    <Head>
      <title>設定</title>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      />
    </Head>
    <Container>
      <h1>Settings</h1>
      <div className="actions">
        <h3>Quick Actions</h3>
        <p>Manage your game and players</p>
        <div className="buttons">
          <a href={`/liff/rooms/${room_id}/players/new`}>Add Player</a>
          <a href={`/liff/rooms/${room_id}/select`}>Select Room</a>
          <a href={`/liff/rooms/${room_id}/games`}>History</a>
        </div>
      </div>
      {/* <div className='information'>
      <h3>Room Information</h3>
      <p>Current room details</p>
      <div className='room-info'>
        <div className='row'>
          <div className='label'>Room Name</div>
          <div className='value'>Temp Game Room 1</div>
        </div>
        <div className='row'>
          <div className='label'>Player count</div>
          <div className='value'>4</div>
        </div>
        <div className='row'>
          <div className='label'>Created At</div>
          <div className='value'>2024/01/01</div>
        </div>
      </div>
    </div> */}
    </Container>
  </> )
};

const Container = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 640px;
  margin: 0 auto;

  .actions,
  .information {
    border: 1px solid #e3e3e3;
    padding: 16px;
    border-radius: 8px;
  }

  h3 {
    margin-bottom: 4px;
    font-size: 24px;
  }

  h3 + p {
    color: #555;
    margin-bottom: 16px;
    font-size: 14px;
  }

  .buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;

    a {
      text-decoration: none;
      color: #fff;
      background-color: #000;
      padding: 12px 16px;
      border-radius: 4px;
      text-align: center;
      font-size: 14px;
      font-weight: 700;
    }
  }
`;

export default SettingsPage;
