const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { jonel } = require('../api');

module.exports.config = {
    name: 'flux',
    version: '1.0.0',
    role: 0,
    hasPrefix: false,
    aliases: ['generate', 'fluximage'],
    description: 'Generate an image from a prompt using Flux API.',
    usage: 'Reply with a prompt (e.g., "flux cat").',
    credits: 'Chilli',
    cooldown: 5,
};

module.exports.run = async function({ api, event }) {
    if (!event.messageReply || !event.messageReply.body) {
        return api.sendMessage('Please provide a prompt for the image generation. Example: "flux cat".', event.threadID, event.messageID);
    }

    const prompt = event.messageReply.body.trim();
    const apiUrl = `${jonel}/api/flux?prompt=${encodeURIComponent(prompt)}`;

    api.sendMessage('Generating image... Please wait.', event.threadID, event.messageID);

    try {
        const response = await axios({
            method: 'GET',
            url: apiUrl,
            responseType: 'arraybuffer',
        });

        const filePath = path.join(__dirname, 'cache', `flux_${Date.now()}.jpg`);
        fs.writeFileSync(filePath, response.data);

        await api.sendMessage({
            body: `Here is the generated image for prompt: "${prompt}"`,
            attachment: fs.createReadStream(filePath),
        }, event.threadID, event.messageID);

        fs.unlinkSync(filePath);
    } catch (error) {
        console.error('Error during image generation:', error.message);
        api.sendMessage('An error occurred while generating the image. Please try again later.', event.threadID, event.messageID);
    }
};
