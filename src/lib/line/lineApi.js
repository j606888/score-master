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
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
