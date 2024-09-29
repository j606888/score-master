import Head from "next/head";
import React, { useEffect } from "react";
import liff from "@line/liff";
import styled from 'styled-components'
import LoadingSkeleton from "@/components/LoadingSkeleton";

const LIFF_ID = process.env.NEXT_PUBLIC_LINE_LIFF_ID

const LiffDemo = () => {

  useEffect(() => {
    console.log('LIFF_ID', LIFF_ID)
    liff.init({
      liffId: LIFF_ID,
    }).then(() => {
      console.log("LIFF init succeeded");
      console.log(liff.getAppLanguage());
      console.log(liff.getVersion());
      console.log(liff.isInClient());
      console.log(liff.isLoggedIn());
      console.log(liff.getOS());
      console.log(liff.getLineVersion());
    }).catch((error) => {
      console.log("LIFF init failed");
      console.error(error);
    });

    console.log("done")
  }, []);

  return (
    <>
      <Head>
        <title>十一萬運作中</title>
      </Head>
      <LoadingSkeleton />
    </>
  );
};

const Container = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 24px;
`

export default LiffDemo;