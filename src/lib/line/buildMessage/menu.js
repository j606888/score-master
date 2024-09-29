import prisma from "@/db";

const LIFF_ID = process.env.NEXT_PUBLIC_LINE_LIFF_ID

export default async function menu(room) {
  const players = await prisma.player.findMany({
    where: {
      room_id: Number(room.id)
    },
    include: {
      records: true
    }
  })

  const addUserUrl = `https://liff.line.me/${LIFF_ID}/rooms/${room.id}/players/new`
  const newGameUrl = `https://liff.line.me/${LIFF_ID}/rooms/${room.id}/games/new`
  const allGamesUrl = `https://liff.line.me/${LIFF_ID}/rooms/${room.id}/games`

  if (players.length === 0) {
    return {
      type: "flex",
      altText: "Menu",
      contents: newMenuJSON(addUserUrl)
    }
  }

  const playersWithTotalScore = players.map(player => ({
    ...player,
    totalScore: player.records.reduce((sum, record) => sum + record.score, 0)
  }));
  const sortedPlayers = playersWithTotalScore.sort((a, b) => b.totalScore - a.totalScore);
  const playerList = sortedPlayers.map(player => playerBlock(player))
  return menuJSON(room, playerList, addUserUrl, newGameUrl, allGamesUrl);
}

function menuJSON(room, playerList, addUserUrl, newGameUrl, allGamesUrl) {
  return {
    "type": "flex",
    "altText": "Menu",
    "contents": {
      "type": "bubble",
      "header": {
        "type": "box",
        "layout": "horizontal",
        "contents": [
          {
            "type": "text",
            "align": "start",
            "color": "#16423C",
            "weight": "bold",
            "gravity": "center",
            "size": "md",
            "flex": 4,
            "text": room.name,
            "wrap": true,
          },
          {
            "type": "button",
            "flex": 3,
            "action": {
              "type": "uri",
              "label": "紀錄",
              "uri": newGameUrl
            },
            "style": "primary",
            "color": "#16423C"
          }
        ]
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "box",
                "layout": "horizontal",
                "contents": [
                  {
                    "type": "text",
                    "text": "名稱",
                    "flex": 5,
                    "color": "#6A9C89"
                  },
                  {
                    "type": "text",
                    "text": "出場數",
                    "flex": 3,
                    "color": "#6A9C89"
                  },
                  {
                    "type": "text",
                    "text": "總分",
                    "align": "end",
                    "flex": 3,
                    "color": "#6A9C89"
                  }
                ]
              },
              ...playerList
            ]
          }
        ]
      },
      "footer": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "separator",
            
          },
          {
            "type": "box",
            "layout": "horizontal",
            "margin": "md",
            "contents": [
              {
                "type": "text",
                "text": "新增玩家",
                "align": "center",
                "color": "#16423C",
                "action": {
                  "type": "uri",
                  "uri": addUserUrl
                }
              },
              {
                "type": "text",
                "text": "查看積分",
                "align": "center",
                "color": "#16423C",
                "action": {
                  "type": "uri",
                  "uri": allGamesUrl
                }
              },
            ]
          }
        ],
      }
    }
  }
}



function playerBlock(player) {
  return {
    "type": "box",
    "layout": "horizontal",
    "contents": [
      {
        "type": "text",
        "text": player.name,
        "flex": 5,
        "weight": "bold"
      },
      {
        "type": "text",
        "text": String(player.gian_count),
        "flex": 3
      },
      {
        "type": "text",
        "text": String(player.totalScore),
        "flex": 3,
        "align": "end",
      }
    ]
  }
}

function newMenuJSON(addUserUrl) {
  return {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": "歡迎使用十一萬",
          "weight": "bold",
          "size": "lg",
          "margin": "none"
        },
        {
          "type": "text",
          "text": "請先新增玩家來開始使用",
          "margin": "sm"
        }
      ]
    },
    "footer": {
      "type": "box",
      "layout": "vertical",
      "spacing": "sm",
      "contents": [
        {
          "type": "button",
          "style": "primary",
          "height": "sm",
          "action": {
            "type": "uri",
            "label": "新增玩家",
            "uri": addUserUrl
          }
        }
      ],
      "flex": 0
    }
  }
}
