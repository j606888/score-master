import prisma from "@/db";

export default async function menu(room) {
  const players = await prisma.players.findMany({
    where: {
      room_id: Number(room.id)
    }
  });

  // if (players.length === 0) {
  //   return {
  //     type: "text",
  //     text: "No players found"
  //   }
  // }

  const menuJSONWithRoomName = { ...menuJSON }
  menuJSONWithRoomName.contents.header.contents[0].text = room.name;
  return menuJSONWithRoomName;
}

const menuJSON = {
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
        "text": "<room.name>"
      },
      {
        "type": "button",
        "flex": 3,
        "action": {
          "type": "uri",
          "label": "Add user",
          "uri": "https://liff.line.me/2006394044-QyRpy3d3"
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
                "align": "end",
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
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "James",
                "flex": 5,
                "weight": "bold"
              },
              {
                "type": "text",
                "text": "22",
                "align": "end",
                "flex": 3
              },
              {
                "type": "text",
                "text": "1200",
                "align": "end",
                "flex": 3
              }
            ]
          },
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "James",
                "flex": 5,
                "weight": "bold"
              },
              {
                "type": "text",
                "text": "22",
                "align": "end",
                "flex": 3
              },
              {
                "type": "text",
                "text": "1200",
                "align": "end",
                "flex": 3
              }
            ]
          },
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "James",
                "flex": 5,
                "weight": "bold"
              },
              {
                "type": "text",
                "text": "22",
                "align": "end",
                "flex": 3
              },
              {
                "type": "text",
                "text": "1200",
                "align": "end",
                "flex": 3
              }
            ]
          },
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "James",
                "flex": 5,
                "weight": "bold"
              },
              {
                "type": "text",
                "text": "22",
                "align": "end",
                "flex": 3
              },
              {
                "type": "text",
                "text": "1200",
                "align": "end",
                "flex": 3
              }
            ]
          }
        ]
      }
    ]
  }
}
}