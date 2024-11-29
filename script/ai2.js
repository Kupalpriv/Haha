const axios = require('axios');
const { kenlie } = require('../api');

module.exports.config = {
    name: 'ai2',
    version: '1.0.1',
    role: 0,
    hasPrefix: false,
    aliases: ['ai2'],
    description: 'Get a response from Pixtral AI',
    usage: 'ai2 [your message]',
    credits: 'kenlie',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const pogi = event.senderID;
    const chilli = args.join(' ');

    if (!chilli) {
        return api.sendMessage('Please provide a prompt, for example: ai2 What is the meaning of life?', event.threadID, event.messageID);
    }

    const bayot = await api.getUserInfo(pogi);
    const lubot = bayot[pogi].name;

    const searchMessage = await api.sendMessage({
        body: `✨ | Searching... Please wait...`,
    }, event.threadID, event.messageID);

    const apiUrl = `${kenlie}/pixtral-paid/?question=${encodeURIComponent(chilli)}`;

    try {
        const response = await axios.get(apiUrl);
        const aiResponse = response.data.response || 'No response from AI.';

        const now = new Date();
        const seconds = now.getSeconds(); 
        const formattedResponse = `
‎ ‎ ‎ ‎${seconds}s

${aiResponse}

CHAT ID: ${event.threadID}
        `;

        await api.editMessage(formattedResponse, searchMessage.messageID);

    } catch (error) {
        console.error('Error:', error);
        await api.editMessage('An error occurred. Please try again later or use Pixtral.', searchMessage.messageID);
    }
};
