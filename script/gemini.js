const axios = require('axios');
const { kenlie } = require('../api'); 

module.exports.config = {
    name: 'gemini',
    version: '1.1.0',
    role: 0,
    hasPrefix: true,
    aliases: ['gemini'],
    description: 'Analyze an image or answer a question using AI.',
    usage: 'gemini [question] (reply with an image attachment)',
    credits: 'chilli',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const attachment = event.messageReply?.attachments[0] || event.attachments[0];
    const question = args.join(' ') || 'Answer all question';
    const imageUrl = attachment && attachment.type === 'photo' ? attachment.url : null;

    if (!imageUrl && !question) {
        return api.sendMessage(
            'Please reply with an image or provide a question.',
            event.threadID,
            event.messageID
        );
    }

    const apiUrl = `${kenlie}/pixtral-paid/?question=${encodeURIComponent(question)}${imageUrl ? `&image_url=${encodeURIComponent(imageUrl)}` : ''}`;

    const initialMessage = await new Promise((resolve, reject) => {
        api.sendMessage('🔍 Processing your request... Please wait.', event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        }, event.messageID);
    });

    try {
        const response = await axios.get(apiUrl);
        const description = response.data.response || 'No response available.';

        const formattedResponse = 
`∞ | 𝘎𝘦𝘮𝘪𝘯𝘪
━━━━━━━━━━━━━━━━━━
${description.trim()}
━━━━━━━━━━━━━━━━━━
-𝐂𝐡𝐢𝐥𝐥𝐢𝐦𝐚𝐧𝐬𝐢`;

        await api.editMessage(formattedResponse.trim(), initialMessage.messageID);
    } catch (error) {
        console.error('Error:', error);
        await api.editMessage('An error occurred while processing your request. Please try again later.', initialMessage.messageID);
    }
};
