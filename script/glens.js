const axios = require('axios');

module.exports.config = {
    name: 'glens',
    version: '1.0.0',
    role: 0,
    hasPrefix: false,
    aliases: ['gl'],
    description: 'Get glens response from an image attachment',
    usage: 'glens [image attachment]',
    credits: 'chilli',
    cooldown: 5,
};

module.exports.run = async function({ api, event }) {
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return api.sendMessage('Please reply to an image attachment to use this command.', event.threadID, event.messageID);
    }

    const imageUrl = event.messageReply.attachments[0].url;

    const apiUrl = `https://deku-rest-apis.ooguy.com/api/glens?url=${encodeURIComponent(imageUrl)}`;

    const loadingMessage = await api.sendMessage('🔍 Processing the image...', event.threadID, event.messageID);

    try {
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data || !data.data || data.data.length === 0) {
            return api.editMessage('No data found for the image.', loadingMessage.messageID);
        }

        const glensInfo = data.data.map(item => `${item.title}\nSource: ${item.domain}`).join('\n\n');
        
        api.editMessage(glensInfo, loadingMessage.messageID);

    } catch (error) {
        console.error('Error processing image:', error);
        api.editMessage('An error occurred while processing the image. Please try again later.', loadingMessage.messageID);
    }
};
