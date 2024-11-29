const axios = require('axios');
const { jonel } = require('../api');

module.exports.config = {
    name: "reactmessage",
    version: "1.0.0",
    description: "Automatically reacts to user messages based on an API.",
    credits: "chill",
};

module.exports.handleEvent = async function ({ api, event }) {
    try {
        const messageText = event.body || "";
        const threadID = event.threadID;
        const messageID = event.messageID;

        if (!messageText) return;

        const apiUrl = `${jonel}/message/emoji?text=${encodeURIComponent(messageText)}`;
        const response = await axios.get(apiUrl);
        const emoji = response.data.emoji;

        await api.setMessageReaction(emoji, messageID, true);
    } catch (error) {
        console.error("Error processing reaction event:", error.message);
    }
};
