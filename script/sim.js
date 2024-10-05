const axios = require("axios");

module.exports.config = {
    name: "sim",
    version: "1.2.1",
    role: 0,
    credits: "Mark Hitsuraan",
    info: "SimSimi reply on command",
    usages: ["message"],
    cd: 1
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;
    
    if (args.length === 0) {
        return api.sendMessage("Please provide a message", threadID, messageID);
    }

    const content = encodeURIComponent(args.join(" "));
    const apiUrl = `https://markdevs-last-api-2epw.onrender.com/sim?q=${content}`;

    try {
        const res = await axios.get(apiUrl);
        const respond = res.data.response;

        if (res.data.error) {
            api.sendMessage(`Error: ${res.data.error}`, threadID, messageID);
        } else if (typeof respond === "string") {
            api.sendMessage(respond, threadID, messageID);
        } else {
            api.sendMessage("Received an unexpected response from the API.", threadID, messageID);
        }
    } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while fetching the data.", threadID, messageID);
    }
};
