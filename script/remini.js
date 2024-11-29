const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { kenlie } = require('../api'); 

module.exports.config = {
    name: 'remini',
    version: '1.2.1',
    role: 0,
    hasPrefix: false,
    aliases: [],
    description: 'Enhance an image by replying with "remini" to an image attachment.',
    usage: 'Reply to an image with "remini".',
    credits: 'chill',
    cooldown: 5,
};

module.exports.run = async function({ api, event }) {
    // Check if the user replied to a message containing an image
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return api.sendMessage('Please reply to an image with "remini" to enhance it.', event.threadID, event.messageID);
    }

    const attachment = event.messageReply.attachments[0];
    if (attachment.type !== 'photo') {
        return api.sendMessage('The attachment must be an image.', event.threadID, event.messageID);
    }

    const imageUrl = attachment.url;
    const apiUrl = `${kenlie}/imgrestore/?imgurl=${encodeURIComponent(imageUrl)}`;

    api.sendMessage('Enhancing the image... Please wait.', event.threadID, event.messageID);

    try {
        
        const response = await axios.get(apiUrl);
        if (!response.data.status || !response.data.response) {
            return api.sendMessage('The enhancement API failed to process the image. Please try again later.', event.threadID, event.messageID);
        }

        const enhancedImageUrl = response.data.response;

        // Download the enhanced image to a temporary file
        const tempPath = path.join(__dirname, 'cache', `remini_${Date.now()}.jpg`);
        const writer = fs.createWriteStream(tempPath);

        const imageStream = await axios({
            method: 'GET',
            url: enhancedImageUrl,
            responseType: 'stream',
        });

        imageStream.data.pipe(writer);

        writer.on('finish', () => {
            // Send the enhanced image as a reply
            api.sendMessage({
                body: 'Here is your enhanced image:',
                attachment: fs.createReadStream(tempPath),
            }, event.threadID, () => {
                // Delete the temporary file after sending
                fs.unlinkSync(tempPath);
            }, event.messageID);
        });

        writer.on('error', (err) => {
            console.error('Error saving the enhanced image:', err);
            api.sendMessage('An error occurred while processing the image. Please try again later.', event.threadID, event.messageID);
        });
    } catch (error) {
        console.error('Error during image enhancement:', error);
        api.sendMessage('An error occurred while enhancing the image. Please try again later.', event.threadID, event.messageID);
    }
};
