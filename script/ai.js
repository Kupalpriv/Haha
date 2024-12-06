const axios = require('axios');
const { kenlie } = require('../api');

module.exports.config = {
    name: 'ai',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: [],
    description: 'Get a response from the BlackBox API',
    usage: 'ai [your text]',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
    const userText = args.join(' ');

    if (!userText) {
        return api.sendMessage('Please provide a question.', event.threadID, event.messageID);
    }

    const startTime = Date.now();
    const loadingMessage = await new Promise((resolve, reject) => {
        api.sendMessage(
            '‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎  ‎𝚂𝚎𝚊𝚛𝚌𝚑𝚒𝚗𝚐...',
            event.threadID,
            (err, info) => {
                if (err) return reject(err);
                resolve(info);
            },
            event.messageID
        );
    });

    const apiUrl = `${kenlie}/blackbox/?text=${encodeURIComponent(userText)}`;

    try {
        const response = await axios.get(apiUrl);
        const apiResponse = response.data.response?.trim() || 'I apologize, but I could not retrieve a valid response.';
        const responseTime = ((Date.now() - startTime) / 1000).toFixed(3);

        await api.editMessage(
            `‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎  ‎${responseTime}s\n\n${apiResponse}\n\nCHAT ID: ${event.threadID}`,
            loadingMessage.messageID
        );
    } catch (error) {
        console.error('Error fetching from the API:', error);
        const errorMessage =
            error.response?.data?.response?.trim() || 'An unexpected error occurred. Please try again later.';
        const responseTime = ((Date.now() - startTime) / 1000).toFixed(3);

        await api.editMessage(
            `‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎  ‎${responseTime}s\n\n${errorMessage}\n\nCHAT ID: ${event.threadID}`,
            loadingMessage.messageID
        );
    }
};
