const axios = require("axios");

module.exports.config = {
    name: "ashley",
    version: "1.0.0",
    role: 0,
    credits: "chilli", 
    description: "Fetch a response from Ashley",
    hasPrefix: true,
    aliases: ["ash"],
    usage: "[ashley <query>]",
    cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
    try {
        if (args.length === 0) {
            api.sendMessage("Please provide a query: ex: ashley subo moto.", event.threadID, event.messageID);
            return;
        }

        const query = args.join(" ");
        const initialMessage = await api.sendMessage("𝙰𝚂𝙷𝙻𝙴𝚈 𝚃𝙰𝙻𝙺𝙸𝙽𝙶....", event.threadID, event.messageID);

        const response = await axios.get(`https://markdevs-last-api-2epw.onrender.com/api/ashley?query=${encodeURIComponent(query)}`);
        const ashleyResponse = response.data.result;

        if (!ashleyResponse) {
            api.sendMessage("No response found from Ashley.", event.threadID, event.messageID);
            return;
        }

        const formattedResponse = `🔞 𝙰𝚂𝙷𝙻𝙴𝚈 𝙷𝙾𝚁𝙽𝚈 𝙰𝙸\n━━━━━━━━━━━━━━━━━━\n${ashleyResponse}\n━━━━━━━━━━━━━━━━━━\n-𝙰𝚂𝙷𝙻𝙴𝚈 𝚃𝙸𝙶𝙽𝙰𝙽 𝙼𝙾 𝙰𝙺𝙾`;

        await api.sendMessage(formattedResponse, event.threadID, event.messageID);

    } catch (error) {
        console.error('Error:', error);
        api.sendMessage("An error occurred while processing the request.", event.threadID, event.messageID);
    }
};
