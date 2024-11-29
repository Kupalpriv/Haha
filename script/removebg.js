const axios = require('axios');
const { kaizen } = require('../api');
const fs = require('fs');

module.exports.config = {
    name: 'removebg',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: ['rmbg'],
    description: 'Remove the background from an image by replying to an image.',
    usage: 'removebg [reply to image]',
    credits: 'churchill',
    cooldown: 5,
};

module.exports.run = async function({ api, event }) {
    const attachment = event.messageReply?.attachments[0];

    if (!attachment || attachment.type !== 'photo') {
        return api.sendMessage('⚠️ Please reply to an image to remove its background.', event.threadID, event.messageID);
    }

    const imageUrl = attachment.url;
    const apiUrl = `${kaizen}/api/removebg?url=${encodeURIComponent(imageUrl)}`;

    const initialMessage = await new Promise((resolve, reject) => {
        api.sendMessage('🔄 Removing background from the image...', event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        }, event.messageID);
    });

    try {
        const response = await axios({
            url: apiUrl,
            method: 'GET',
            responseType: 'stream',
        });

        const filePath = `${__dirname}/removed_bg.png`;
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await api.sendMessage(
            {
                body: '✅ Background removed successfully!',
                attachment: fs.createReadStream(filePath),
            },
            event.threadID,
            event.messageID
        );

        fs.unlinkSync(filePath);
    } catch (error) {
        console.error('Error removing background:', error);
        await api.editMessage('❌ Failed to remove the background. Please try again later.', initialMessage.messageID);
    }
};
