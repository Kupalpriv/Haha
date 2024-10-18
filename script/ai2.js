const axios = require('axios');

module.exports.config = {
    name: 'ai2',
    version: '1.0.0',
    role: 0,
    hasPrefix: false,
    aliases: ['gpt4v2'],
    description: 'Get a response from GPT-4v2',
    usage: 'ai2 [your message]',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const chilli = args.join(' ');

    if (!chilli) {
        return api.sendMessage('Please provide a prompt, for example: ai2 What is the meaning of life?', event.threadID, event.messageID);
    }

    const pogi = await new Promise((resolve, reject) => {
        api.sendMessage({
            body: `🔍 Searching for: "${chilli}"...`,
        }, event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        }, event.messageID);
    });

    const apiUrl = `https://betadash-api-swordslush.vercel.app/gpt-4o-freev2?ask=${encodeURIComponent(chilli)}`;

    try {
        const response = await axios.get(apiUrl);
        const gpt4Response = response.data.message || 'No response from GPT-4v2.';

        await api.editMessage(gpt4Response, pogi.messageID);

    } catch (error) {
        console.error('Error:', error);
        await api.editMessage('An error occurred while fetching the response. Please try again later.', pogi.messageID);
    }
};
