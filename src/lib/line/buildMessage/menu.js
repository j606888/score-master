import prisma from "@/db";

export default async function menu(room) {
  console.log(room)
  const players = await prisma.player.findMany({
    where: {
      room_id: Number(room.id)
    },
    include: {
      records: true
    }
  });

  const playerList = players.map(player => {

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
          "align": "end",
          "flex": 3
        },
        {
          "type": "text",
          "text": String(player.records.reduce((sum, record) => sum + (record.score || 0), 0)),
          "align": "end",
          "flex": 3
        }
      ]
    }
  })

  // if (players.length === 0) {
  //   return {
  //     type: "text",
  //     text: "No players found"
  //   }
  // }

  console.log('playerList', JSON.stringify(playerList))

  const addUserUrl = `https://liff.line.me/2006394044-QyRpy3d3/rooms/${room.id}/players`

  const menuJSONWithRoomName = { ...menuJSON }
  menuJSONWithRoomName.contents.header.contents[0].text = room.name;
  menuJSONWithRoomName.contents.header.contents[1].action.uri = addUserUrl

  if (playerList.length > 0) {
    menuJSONWithRoomName.contents.body.contents[0].contents = [...menuJSONWithRoomName.contents.body.contents[0].contents, ...playerList]
  }

  // console.log(JSON.stringify(menuJSONWithRoomName.contents.body.contents[0].contents))
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
            "label": "User",
            "uri": `https://liff.line.me/2006394044-QyRpy3d3/rooms/110/players`
          },
          "style": "primary",
          "color": "#16423C"
        },
        {
          "type": "button",
          "flex": 3,
          "action": {
            "type": "uri",
            "label": "Game",
            "uri": `https://liff.line.me/2006394044-QyRpy3d3/rooms/110/new-game`
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
            }
          ]
        }
      ]
    }
  }
}