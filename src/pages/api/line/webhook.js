import { replyToMessage } from "@/lib/line/lineApi";
import { parseMessage } from "@/lib/line/parseMessage";
import { handleAction } from "@/lib/line/actionHandler";

export default async function handler(req, res) {
  const { replyToken, message, messageType } = parseMessage(req.body);

  if (messageType === "text") {
    
    const messages = [
      handleAction(message)
    ]


    try {
      await replyToMessage(replyToken, messages);
    } catch (error) {
      console.error('Error:', error.response.data);
    }
  }

  res.status(200).end();
}
