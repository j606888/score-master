import saveSuccess from "./saveSuccess.json";
import menu from "./menu.json";

export function handleAction(text) {
  const action = text.toLowerCase();
  if (action === "save") {
    return saveSuccess;
  } else if (action === "menu") {
    return menu;
  } else {
    return {
      type: "text",
      text: "I'm sorry, I didn't understand that."
    };
  }
}

