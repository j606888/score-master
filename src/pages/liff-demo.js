import Head from "next/head";
import React, { useEffect } from "react";
import liff from "@line/liff";



const LiffDemo = () => {

  useEffect(() => {
    liff.init({
      liffId: "2006394044-QyRpy3d3",
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
        <title>Liff Demo</title>
      </Head>
      <div>Liff Demo</div>
    </>
  );
};

export default LiffDemo;