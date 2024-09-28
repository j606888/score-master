import menu from "./menu";
import saveSuccess from "./saveSuccess";

export const TYPES = {
  MENU: "menu",
  ROOMS: "rooms",
  SAVE: "save",
}

export default async function buildMessage(type, room) {
  switch (type) {
    case TYPES.MENU:
      return await menu(room);
    case TYPES.SAVE:
      return await saveSuccess(room)
  }
}
