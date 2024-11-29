const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { jonel } = require('../api'); 

module.exports.config = {
    name: 'flux',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: [],
    description: 'Generate an image using the Flux API based on the provided prompt.',
    usage: 'flux [prompt]',
    credits: 'chilli',
    cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
    if (args.length === 0) {
        return api.sendMessage('Please provide a prompt to generate the image.\n\nEx: flux dog', event.threadID, event.messageID);
    }

    const prompt = args.join(' ');
    const apiUrl = `${jonel}/api/flux?prompt=${encodeURIComponent(prompt)}`;

    let waitingMessageID;

    try {
        const waitingMessage = await api.sendMessage(`🔍 Generating image for: "${prompt}"`, event.threadID);
        waitingMessageID = waitingMessage.messageID;

        setTimeout(() => {
            if (waitingMessageID) {
                api.unsendMessage(waitingMessageID);
            }
        }, 15000);

        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');

        const tempFilePath = path.resolve(__dirname, 'flux_generated_image.jpg');
        fs.writeFileSync(tempFilePath, buffer);

        await api.sendMessage(
            {
                body: `🎨 Here is the generated image for: "${prompt}"`,
                attachment: fs.createReadStream(tempFilePath),
            },
            event.threadID,
            event.messageID
        );

        fs.unlinkSync(tempFilePath);
    } catch (error) {
        console.error('Error generating image:', error);
        api.sendMessage('Failed to generate the image. Please try again later.', event.threadID, event.messageID);
    }
};
