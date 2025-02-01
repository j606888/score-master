import Head from "next/head";
import React, { useEffect } from "react";
import liff from "@line/liff";
import LoadingSkeleton from "@/components/LoadingSkeleton";

const LIFF_ID = process.env.NEXT_PUBLIC_LINE_LIFF_ID

const LiffDemo = () => {
  useEffect(() => {
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

export default LiffDemo;