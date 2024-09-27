import saveSuccess from "./saveSuccess.json";

export function handleAction(text) {
  const action = text.toLowerCase();
  if (action === "success") {
    return saveSuccess;
  } else if (action === "cancel") {
    return {
      type: "text",
      text: "Thank you for using our service. Have a great day!"
    };
  } else {
    return {
      type: "text",
      text: "I'm sorry, I didn't understand that."
    };
  }
}

