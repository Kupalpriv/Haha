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
    description: 'Combine two emojis into a unique emojimix!',
    usage: 'emojimix [emoji1] [emoji2]',
    credits: 'Kaizen',
    cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
    if (args.length < 2) {
        return api.sendMessage('Please provide two emojis to mix. Example: emojimix 😹 😸', event.threadID, event.messageID);
    }

    const [emoji1, emoji2] = args;
    const apiUrl = `${kaizen}/api/emojimix?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}`;

    try {
        const response = await axios.get(apiUrl);
        const imageUrl = response.data.response;

        if (!imageUrl) {
            return api.sendMessage('Failed to generate emojimix. Please try again later.', event.threadID, event.messageID);
        }

        const tempPath = path.join(__dirname, 'cache', `emojimix_${Date.now()}.png`);
        const writer = fs.createWriteStream(tempPath);

        const imageStream = await axios({
            method: 'GET',
            url: imageUrl,
            responseType: 'stream',
        });

        imageStream.data.pipe(writer);

        writer.on('finish', () => {
            api.sendMessage(
                {
                    attachment: fs.createReadStream(tempPath),
                },
                event.threadID,
                () => fs.unlinkSync(tempPath),
                event.messageID
            );
        });

        writer.on('error', (err) => {
            console.error('Error saving emojimix image:', err);
            api.sendMessage('An error occurred while processing your Emojimix. Please try again later.', event.threadID, event.messageID);
        });
    } catch (error) {
        console.error('Error during emojimix generation:', error);
        api.sendMessage('An error occurred while generating your Emojimix. Please try again later.', event.threadID, event.messageID);
    }
};
