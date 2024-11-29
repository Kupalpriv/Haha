const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { canvas } = require('../api');

module.exports.config = {
    name: 'miga',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: [],
    description: 'Generate a fun image using the API',
    usage: 'miga [mention or reply]',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function ({ api, event }) {
    const userID = event.messageReply?.senderID || Object.keys(event.mentions)[0] || event.senderID;

    if (!userID) {
        return api.sendMessage('❗ Please mention or reply to someone message.', event.threadID, event.messageID);
    }

    const apiUrl = `${canvas}/nigga?userid=${userID}`;
    const filePath = path.resolve(__dirname, 'miga.png');

    try {
        const response = await axios({
            url: apiUrl,
            method: 'GET',
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await api.sendMessage(
            {
                attachment: fs.createReadStream(filePath),
            },
            event.threadID,
            event.messageID
        );

        fs.unlinkSync(filePath);
    } catch (error) {
        console.error('Error:', error);
        api.sendMessage('❌ Failed to generate the Miga image. Please try again later.', event.threadID, event.messageID);
    }
};
