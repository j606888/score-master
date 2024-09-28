import React, { useEffect } from "react";
import liff from "@line/liff";

const LIFF_ID = process.env.LINE_LIFF_ID

export default function useLiff() {
  useEffect(() => {
    liff
      .init({
        liffId: LIFF_ID,
      })
      .then(() => {
        console.log("LIFF init succeeded");
      })
      .catch((error) => {
        console.log("LIFF init failed");
        console.error(error);
      });
  }, []);

  const sendMessage = async (text) => {
    await liff.sendMessages([
      {
        type: "text",
        text,
      }
    ])
  }

  const closeWindow = () => {
    liff.closeWindow()
  }

  return {
    sendMessage,
    closeWindow,
  }
}
