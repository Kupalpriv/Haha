const axios = require('axios');

module.exports.config = {
    name: 'gpt',
    version: '1.0.0',
    role: 0,
    hasPrefix: false,
    aliases: ['gpt'],
    description: 'Interact with GPT-4 AI',
    usage: 'gpt [query]',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const query = args.join(' ');

    if (!query) {
        return api.sendMessage('Please provide a query, for example: gpt what is the meaning of life?', event.threadID, event.messageID);
    }

    const initialMessage = await new Promise((resolve, reject) => {
        api.sendMessage('𝙶𝙿𝚃4 𝙰𝙽𝚂𝚆𝙴𝚁𝙸𝙽𝙶...', event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        });
    });

    try {
        const response = await axios.get('https://markdevs-last-api-2epw.onrender.com/api/v2/gpt4', {
            params: { query }
        });
        const aiResponse = response.data;
        const responseString = aiResponse.gpt4 ? aiResponse.gpt4 : 'No result found.';

        const formattedResponse = `
𝙶𝙿𝚃4 𝙰𝙸
━━━━━━━━━━━━━━━━━━
${responseString}
━━━━━━━━━━━━━━━━━━
-𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝙶𝙿𝚃
        `;

        await api.editMessage(formattedResponse.trim(), initialMessage.messageID);

    } catch (error) {
        console.error('Error:', error);
        await api.editMessage('An error occurred, please try using the "ai2" command.', initialMessage.messageID);
    }
};
