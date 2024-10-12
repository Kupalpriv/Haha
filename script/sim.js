const axios = require("axios");

module.exports.config = {
    name: "sim",
    version: "1.2.1",
    role: 0,
    credits: "chilli",
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
    const apiUrl = `https://hiroshi-api.onrender.com/other/sim?ask=${content}`;

    try {
        const res = await axios.get(apiUrl);
        const respond = res.data.answer;

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
