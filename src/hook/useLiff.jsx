import React, { useEffect } from "react";
import liff from "@line/liff";

const LIFF_ID = "2006394044-QyRpy3d3"

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
}
