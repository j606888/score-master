import prisma from "@/db"

export default async function saveSuccess(room) {
  const lastGame = await prisma.game.findFirst({
    where: {
      room_id: Number(room.id)
    },
    orderBy: {
      created_at: 'desc'
    },
    include: {
      records: {
        include: {
          player: true
        }
      }
    }
  });

  if (!lastGame) {
    return {
      type: "text",
      text: "No games found for this room."
    };
  }

  const formattedDate = new Date(lastGame.created_at).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Taipei'
  });

  const playerRecords = lastGame.records
    .sort((a, b) => b.score - a.score)
    .map(record => ({
    type: "box",
    layout: "horizontal",
    contents: [
      {
        type: "text",
        text: record.player.name
      },
      {
        type: "text",
        text: String(record.score) || "",
        align: "end"
      }
    ],
    paddingStart: "10%",
    paddingEnd: "10%"
  }));

  return {
    type: "flex",
    altText: "Save Success",
    contents: {
      type: "bubble",
      hero: {
        type: "image",
        url: "https://james-niuniu.s3.ap-southeast-1.amazonaws.com/save2.jpg",
        size: "100%",
        aspectMode: "cover",
        action: {
          type: "uri",
          uri: "https://line.me/"
        },
        aspectRatio: "12:8"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: formattedDate,
            size: "xs",
            color: "#999999",
            align: "center",
            weight: "regular"
          },
          {
            type: "box",
            layout: "vertical",
            contents: [],
            paddingTop: "20px"
          },
          {
            type: "box",
            layout: "vertical",
            contents: playerRecords
          }
        ]
      }
    }
  };
}