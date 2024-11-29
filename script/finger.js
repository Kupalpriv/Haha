const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { canvas } = require('../api');

module.exports.config = {
    name: 'finger',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: [],
    description: 'Generate a "finger" image using the API',
    usage: 'finger [mention or reply]',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function ({ api, event }) {
    const senderID = event.senderID;
    const targetID = event.messageReply?.senderID || Object.keys(event.mentions)[0];

    if (!targetID) {
        return api.sendMessage('❗ Please mention or reply to someone to use this command.', event.threadID, event.messageID);
    }

    const apiUrl = `${canvas}/finger?uid1=${senderID}&uid2=${targetID}`;
    const filePath = path.resolve(__dirname, 'finger.png');

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
        api.sendMessage('❌ Failed to generate the finger image. Please try again later.', event.threadID, event.messageID);
    }
};
