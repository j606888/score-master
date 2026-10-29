import Head from "next/head";
import styled from "styled-components";

const InvalidLinkPage = () => {
  return (
    <>
      <Head>
        <title>連結已失效</title>
      </Head>
      <Container>
        <h1>連結已失效</h1>
        <p>請回到 LINE 重新輸入「麻將」，用新的選單開啟。</p>
      </Container>
    </>
  );
};

const Container = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #16423C;

  h1 {
    font-size: 20px;
    margin-bottom: 12px;
  }

  p {
    font-size: 15px;
    line-height: 1.6;
  }
`;

export default InvalidLinkPage;
