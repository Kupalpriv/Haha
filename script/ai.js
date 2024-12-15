const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { kaizen } = require('../api');

module.exports.config = {
    name: 'ai',
    version: '1.2.0',
    role: 0,
    hasPrefix: true,
    aliases: [],
    description: 'Get a response or generated image from the GPT-4 API',
    usage: 'ai [your text]',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
    const userText = args.join(' ');

    if (!userText) {
        return api.sendMessage('Please provide a question.', event.threadID, event.messageID);
    }

    const startTime = Date.now();
    const loadingMessage = await new Promise((resolve, reject) => {
        api.sendMessage(
            '‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎  ‎𝚂𝚎𝚊𝚛𝚌𝚑𝚒𝚗𝚐...',
            event.threadID,
            (err, info) => {
                if (err) return reject(err);
                resolve(info);
            },
            event.messageID
        );
    });

    const apiUrl = `${kaizen}/api/gpt-4o-pro?q=${encodeURIComponent(userText)}&uid=1`;

    try {
        const response = await axios.get(apiUrl);
        const apiResponse = response.data.response?.trim() || 'I apologize, but I could not retrieve a valid response.';
        const responseTime = ((Date.now() - startTime) / 1000).toFixed(3);

        if (apiResponse.startsWith('TOOL_CALL: generateImage')) {
            const imageUrlMatch = apiResponse.match(/\!\[Generated Image.*\]\((.*?)\)/);
            const imageUrl = imageUrlMatch ? imageUrlMatch[1] : null;

            if (imageUrl) {
                const imagePath = path.join(__dirname, 'generated_image.png');
                const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
                const writer = fs.createWriteStream(imagePath);

                imageResponse.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                await api.sendMessage(
                    {
                        body: `‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎  ‎${responseTime}s\n\nGenerated Image:`,
                        attachment: fs.createReadStream(imagePath),
                    },
                    event.threadID,
                    () => fs.unlinkSync(imagePath),
                    event.messageID
                );
                return;
            }
        }

        await api.editMessage(
            `‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎  ‎${responseTime}s\n\n${apiResponse}\n\nCHAT ID: ${event.threadID}`,
            loadingMessage.messageID
        );
    } catch (error) {
        const errorMessage =
            error.response?.data?.response?.trim() || 'An unexpected error occurred. Please try again later.';
        const responseTime = ((Date.now() - startTime) / 1000).toFixed(3);

        await api.editMessage(
            `‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎  ‎${responseTime}s\n\n${errorMessage}\n\nCHAT ID: ${event.threadID}\n\nPlease try again later.`,
            loadingMessage.messageID
        );
    }
};
