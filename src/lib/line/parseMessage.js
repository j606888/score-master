export const SOURCE_MAP = {
  user: {
    sourceType: 0,
    sourceKey: 'userId'
  },
  group: {
    sourceType: 1,
    sourceKey: 'groupId'
  },
  room: {
    sourceType: 2,
    sourceKey: 'roomId'
  }
}

export function parseMessage(requestBody, { debug =false } = {}) {
  const replyToken = requestBody.events[0].replyToken;
  const message = requestBody.events[0].message.text;
  const messageType = requestBody.events[0].message.type;
  const source = requestBody.events[0].source;

  if (debug) {
    console.log(requestBody.events[0]);
  }

  return { replyToken, message, messageType, source };
}
