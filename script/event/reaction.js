const fetch = require("node-fetch");

module.exports.config = {
    name: "reaction",
    version: "1.0.0",
};

module.exports.handleEvent = async function ({ api, event }) {
    const { messageID, body } = event;

    try {
        if (body && body.trim()) {
            const encodedText = encodeURIComponent(body.trim());
            const apiUrl = `https://ccprojectapis.ddns.net/api/message/emoji?text=${encodedText}`;
            const response = await fetch(apiUrl);

            if (!response.ok) throw new Error("Failed to fetch emoji from API");

            const data = await response.json();
            const emoji = data.emoji;

            if (emoji) {
                api.setMessageReaction(emoji, messageID, true);
            }
        }
    } catch (error) {
        console.error("Error in reaction event:", error.message);
    }
};
