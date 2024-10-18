const axios = require('axios');

module.exports.config = {
    name: 'ai2',
    version: '1.0.0',
    role: 0,
    hasPrefix: false,
    aliases: ['ai2'],
    description: 'Get a response from GPT-4v2',
    usage: 'ai2 [your message]',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const userQuery = args.join(' ');

    if (!userQuery) {
        return api.sendMessage('Please provide a prompt, for example: ai2 What is the meaning of life?', event.threadID, event.messageID);
    }

    const apiUrl = `https://betadash-api-swordslush.vercel.app/gpt-4o-freev2?ask=${encodeURIComponent(userQuery)}`;

    try {
        const response = await axios.get(apiUrl);
        const gpt4Response = response.data.message || 'No response from GPT-4v2.';

        await api.sendMessage(gpt4Response, event.threadID, event.messageID);

    } catch (error) {
        console.error('Error:', error);
        await api.sendMessage('An error occurred while fetching the response. Please try again later.', event.threadID, event.messageID);
    }
};
