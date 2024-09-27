import { replyToMessage } from "@/lib/line/lineApi";

export default async function handler(req, res) {
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  const replyToken = req.body.events[0].replyToken;
  const messages = [
    {
      type: "text",
      text: "Hello, user",
    },
    {
      type: "text",
      text: "May I help you?",
    },
  ];

  try {
    const response = await replyToMessage(replyToken, messages);
    console.log('Response:', response);
  } catch (error) {
    console.error('Error:', error);
  }

  res.status(200).end();
}
