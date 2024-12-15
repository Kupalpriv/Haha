const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { kaizen } = require('../api');

module.exports.config = {
    name: 'emojimix',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: [],
    description: 'Combine two emojis into one using Emojimix API.',
    usage: 'emojimix [emoji1] [emoji2]',
    credits: 'chilli',
    cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (args.length < 2) {
        return api.sendMessage('Please provide two emojis to mix.\n\nExample: emojimix 👻 💀', threadID, messageID);
    }

    const emoji1 = encodeURIComponent(args[0]);
    const emoji2 = encodeURIComponent(args[1]);
    const apiUrl = `${kaizen}/api/emojimix?emoji1=${emoji1}&emoji2=${emoji2}`;
    const tempFilePath = path.resolve(__dirname, 'emojimix.png');

    let loadingMessageID;

    try {
        const loadingMessage = await api.sendMessage('Mixing your emojis, please wait...', threadID, messageID);
        loadingMessageID = loadingMessage.messageID;

        const response = await axios.get(apiUrl, { responseType: 'stream' });
        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await api.sendMessage(
            {
                body: 'Here is your mixed emoji:',
                attachment: fs.createReadStream(tempFilePath),
            },
            threadID,
            () => {
                if (loadingMessageID) api.unsendMessage(loadingMessageID);
            },
            messageID
        );

        fs.unlinkSync(tempFilePath);
    } catch (error) {
        console.error('Error fetching emojimix:', error);
        api.sendMessage('Failed to mix the emojis. Please try again later.', threadID, messageID);
        if (loadingMessageID) api.unsendMessage(loadingMessageID);
    }
};
