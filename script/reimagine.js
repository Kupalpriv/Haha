const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { kaizen } = require('../api'); // Importing the API base URL

module.exports.config = {
    name: 'reimagine',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: ['reimagine'],
    description: 'Generate a reimagined version of an image attachment.',
    usage: 'reimagine [reply to an image attachment]',
    credits: 'churchill',
    cooldown: 5,
};

module.exports.run = async function({ api, event }) {
    const repliedAttachment = event.messageReply?.attachments[0];

    if (!repliedAttachment || repliedAttachment.type !== 'photo') {
        return api.sendMessage(
            'Please reply to an image attachment to reimagine it.',
            event.threadID,
            event.messageID
        );
    }

    const imageUrl = repliedAttachment.url;
    const apiUrl = `${kaizen}/api/reimagine?url=${encodeURIComponent(imageUrl)}`;

    const loadingMessage = await new Promise((resolve, reject) => {
        api.sendMessage(
            '✨ Reimagining your image, please wait...',
            event.threadID,
            (err, info) => {
                if (err) return reject(err);
                resolve(info);
            },
            event.messageID
        );
    });

    const tempFilePath = path.resolve(__dirname, 'reimagined_image.jpg');

    try {
        const response = await axios({
            url: apiUrl,
            method: 'GET',
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await api.sendMessage(
            {
                attachment: fs.createReadStream(tempFilePath), // Sends the image as an attachment only
            },
            event.threadID,
            event.messageID
        );

        fs.unlinkSync(tempFilePath); // Clean up the temp file
    } catch (error) {
        console.error('Error during reimagine process:', error);

        api.sendMessage(
            'An error occurred while reimagining the image. Please try again later.',
            event.threadID,
            event.messageID
        );
    }
};
