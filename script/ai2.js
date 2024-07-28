const axios = require("axios");

module.exports.config = {
    name: "ai2",
    version: "1.0.0",
    role: 0,
    credits: "chill",
    description: "Ask Mistral AI a question",
    hasPrefix: false,
    aliases: ["mistral"],
    usage: "ai2 <question>",
    cooldown: 3
};

module.exports.run = async function({ api, event, args }) {
    try {
        const question = args.join(" ");
        if (!question) {
            api.sendMessage("Usage: mistral <question>", event.threadID);
            return;
        }

        const url = `https://hiroshi-rest-api.replit.app/ai/mistral8x7B?ask=${encodeURIComponent(question)}`;
        const pendingMessageID = (await api.sendMessage("𝙼𝙸𝚂𝚃𝚁𝙰𝙻 𝙸𝚂 𝙰𝙽𝚂𝚆𝙴𝚁𝙸𝙽𝙶 𝙿𝙻𝚂𝚂𝚂 𝚆𝙰𝙸𝚃𝚃𝚃...", event.threadID)).messageID;

        const response = await axios.get(url);
        const mistralResponse = response.data.response.trim();

        const formattedMessage = `💤 | 𝙼𝙸𝚂𝚃𝚁𝙰𝙻 𝙰𝙸
━━━━━━━━━━━━━━━━━━
${mistralResponse}
━━━━━━━━━━━━━━━━━━
🗣 𝙰𝚜𝚔𝚎𝚍 𝚋𝚢: ${event.senderID}`;

        api.editMessage(formattedMessage, event.threadID, pendingMessageID);

    } catch (error) {
        console.error('Error:', error);
        api.sendMessage("An error occurred while processing the request.", event.threadID);
    }
};
