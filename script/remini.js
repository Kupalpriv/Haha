const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { kaizen } = require('../api');

module.exports.config = {
    name: 'remini',
    version: '1.1.0',
    role: 0,
    hasPrefix: true,
    aliases: [],
    description: '',
    usage: '',
    credits: 'chilli',
    cooldown: 5,
};

module.exports.run = async function ({ api, event }) {
    const { messageReply, threadID, messageID } = event;

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0)
        return api.sendMessage('Reply to an image to upscale it.', threadID, messageID);

    const attachment = messageReply.attachments[0];
    if (attachment.type !== 'photo')
        return api.sendMessage('This command only works with image attachments.', threadID, messageID);

    const imageUrl = attachment.url;
    const upscaleApi = `${kaizen}/api/upscale?url=${encodeURIComponent(imageUrl)}`;
    const tempFilePath = path.resolve(__dirname, 'upscaled_image.jpeg');

    let loadingMessageID;

    try {
        const loadingMessage = await api.sendMessage('Upscaling image...', threadID, messageID);
        loadingMessageID = loadingMessage.messageID;

        const response = await axios.get(upscaleApi, { responseType: 'stream' });
        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await api.sendMessage(
            { attachment: fs.createReadStream(tempFilePath) },
            threadID,
            () => {
                if (loadingMessageID) api.unsendMessage(loadingMessageID);
            },
            messageID
        );

        fs.unlinkSync(tempFilePath);
    } catch (error) {
        console.error('Failed to upscale image:', error);
        api.sendMessage('Failed to process the image. Try again later.', threadID, messageID);

        if (loadingMessageID) api.unsendMessage(loadingMessageID);
    }
};
