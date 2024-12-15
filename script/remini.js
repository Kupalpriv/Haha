const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { kaizen } = require('../api');

module.exports.config = {
    name: 'remini',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: [],
    description: 'Upscale an image by replying to it.',
    usage: 'remini (reply to an image)',
    credits: 'chilli',
    cooldown: 5,
};

module.exports.run = async function ({ api, event }) {
    const { messageReply, threadID, messageID } = event;

    if (!messageReply || !messageReply.attachments || messageReply.attachments[0]?.type !== 'photo') {
        return api.sendMessage('Please reply to an image to upscale it.', threadID, messageID);
    }

    const imageUrl = messageReply.attachments[0].url;
    const upscaleApiUrl = `${kaizen}/api/upscale?url=${encodeURIComponent(imageUrl)}`;
    const tempFilePath = path.resolve(__dirname, 'temp_upscaled.jpg');

    let loadingMessageID;

    try {
        const loadingMessage = await api.sendMessage('𝐸𝑛ℎ𝑎𝑛𝑐𝑖𝑛𝑔...', threadID, messageID);
        loadingMessageID = loadingMessage.messageID;

        const response = await axios.get(upscaleApiUrl);
        const upscaleResult = response.data.url;

        if (!upscaleResult) throw new Error('No upscaled image URL returned.');

        const imageStream = await axios({
            url: upscaleResult,
            method: 'GET',
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(tempFilePath);
        imageStream.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await api.sendMessage(
            {
                body: 'Here is your upscaled image:',
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
        api.sendMessage('Failed to process the image. Please try again later.', threadID, messageID);
        if (loadingMessageID) api.unsendMessage(loadingMessageID);
    }
};
