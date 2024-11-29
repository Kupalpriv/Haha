const axios = require('axios');
const { kaizen } = require('../api');
const fs = require('fs');

module.exports.config = {
    name: 'zombie',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: ['zombify'],
    description: 'Turn an image into a zombie version by replying to an image.',
    usage: 'zombie [reply to image]',
    credits: 'churchill',
    cooldown: 5,
};

module.exports.run = async function({ api, event }) {
    const attachment = event.messageReply?.attachments[0];

    if (!attachment || attachment.type !== 'photo') {
        return api.sendMessage('⚠️ Please reply to an image to zombify it.', event.threadID, event.messageID);
    }

    const imageUrl = attachment.url;
    const apiUrl = `${kaizen}/api/zombie?url=${encodeURIComponent(imageUrl)}`;

    const initialMessage = await new Promise((resolve, reject) => {
        api.sendMessage('🔄 Applying zombie effect to the image...', event.threadID, (err, info) => {
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

        const filePath = `${__dirname}/zombie_image.png`;
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await api.sendMessage(
            {
                body: '🧟 ROAR!',
                attachment: fs.createReadStream(filePath),
            },
            event.threadID,
            event.messageID
        );

        fs.unlinkSync(filePath);
    } catch (error) {
        console.error('Error applying zombie effect:', error);
        await api.editMessage('❌ Failed to zombify the image. Please try again later.', initialMessage.messageID);
    }
};
