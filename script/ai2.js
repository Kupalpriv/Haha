const axios = require('axios');
const { markApi } = require('../api');

module.exports.config = {
    name: 'ai2',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: ['gpt4v2'],
    description: 'Get a response from GPT-4 using a custom API',
    usage: 'ai2 [your query]',
    credits: 'markdevs69',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const userQuery = args.join(' ');

    if (!userQuery) {
        return api.sendMessage('Please provide a query, for example: ai2 What is AI?', event.threadID, event.messageID);
    }

    const loadingMessage = await new Promise((resolve, reject) => {
        api.sendMessage('🔄 Processing your query...', event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        }, event.messageID);
    });

    const apiUrl = `${markApi}/new/gpt4?query=${encodeURIComponent(userQuery)}`;

    try {
        const response = await axios.get(apiUrl);
        const apiResponse = response.data.respond || 'No response from the API.';

        const formattedResponse = 
`🧩 | GPT-4 Response
━━━━━━━━━━━━━━━━━━
${apiResponse}
━━━━━━━━━━━━━━━━━━
📌 Chat ID: ${event.threadID}`;

        await api.editMessage(formattedResponse, loadingMessage.messageID);

    } catch (error) {
        console.error('Error:', error);
        await api.editMessage('An error occurred while processing your request. Please try again later.', loadingMessage.messageID);
    }
};
