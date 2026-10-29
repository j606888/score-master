import axios from "axios";

const TOKEN = process.env.LINE_ACCESS_TOKEN;

export async function replyToMessage(replyToken, messages) {
  const dataString = JSON.stringify({
    replyToken: replyToken,
    messages: messages,
  });

  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + TOKEN,
  };

  const webhookOptions = {
    url: "https://api.line.me/v2/bot/message/reply",
    method: "POST",
    headers: headers,
    data: dataString,
  };

  try {
    const response = await axios(webhookOptions);
    return response.data;
  } catch (error) {
    // 不要記整個 error：error.config.headers 內含 Authorization token
    console.error('LINE reply failed:', {
      status: error.response?.status,
      data: error.response?.data,
      requestId: error.response?.headers?.['x-line-request-id'],
      code: error.code,
      message: error.message,
    });
    throw error;
  }
}
