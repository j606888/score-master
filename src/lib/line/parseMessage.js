export function parseMessage(requestBody) {
  const replyToken = requestBody.events[0].replyToken;
  const message = requestBody.events[0].message.text;
  const messageType = requestBody.events[0].message.type;
  return { replyToken, message, messageType };
}
