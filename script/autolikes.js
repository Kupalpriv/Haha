const axios = require("axios");

module.exports.config = {
  name: "autolikes",
  version: "1.0.0",
  hasPermission: 0,
  credits: "churchill",
  description: "Automatically likes a Facebook post using a provided API with user-defined cookie and reaction type.",
  commandCategory: "Utilities",
  usages: "[COOKIE] [URL] [REACT]",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args }) {
  const cookie = args[0];
  const postLink = args[1];
  let react = args[2];

  if (!cookie || !postLink || !react) {
    return api.sendMessage("Usage: [COOKIE] [POST_URL] [REACT]\nExample: autolikes cookie_here https://www.facebook.com/post_url LOVE", event.threadID);
  }

  if (!postLink.startsWith("http")) {
    return api.sendMessage("Please provide a valid Facebook post link!", event.threadID);
  }

  react = react.toUpperCase();

  const validReacts = ["LIKE", "LOVE", "HAHA", "WOW", "SAD", "ANGRY", "CARE"];
  if (!validReacts.includes(react)) {
    return api.sendMessage(`Invalid reaction type! Available reactions are: ${validReacts.join(", ")}`, event.threadID);
  }

  const apiUrl = `https://rplikers-credit-mahiro.onrender.com/api/react?cookie=${encodeURIComponent(cookie)}&link=${encodeURIComponent(postLink)}&react=${react}`;

  try {
    const response = await axios.get(apiUrl);

    if (response.data.status === "success") {
      api.sendMessage(
        `Auto-like successful! Reaction: ${react}\nMessage: ${response.data.message}`,
        event.threadID
      );
    } else {
      api.sendMessage("Failed to send reaction.", event.threadID);
    }
  } catch (error) {
    console.error("Error in auto-likes command:", error);
    api.sendMessage("An error occurred while processing the request.", event.threadID);
  }
};
