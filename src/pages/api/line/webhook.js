import { replyToMessage } from "@/lib/line/lineApi";
import { parseMessage } from "@/lib/line/parseMessage";
import { handleAction } from "@/lib/line/actionHandler";

export default async function handler(req, res) {
  if (req.body.events.length === 0) {
    res.status(200).end();
    return;
  }

  const { replyToken, message, messageType, source } = parseMessage(req.body);

  if (messageType === "text") {
    const handleActionResponse = await handleAction(message, source);
    const messages = [
      handleActionResponse
    ]


    try {
      await replyToMessage(replyToken, messages);
    } catch (error) {
      console.error('Error:', error.response.data);
    }
  }

  res.status(200).end();
}
