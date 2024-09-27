import menu from "./menu";

export const TYPES = {
  MENU: "menu",
  ROOMS: "rooms",
  SAVE: "save",
}

export default async function buildMessage(type, room) {
  switch (type) {
    case TYPES.MENU:
      return await menu(room);
  }
}
