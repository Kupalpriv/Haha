const axios = require('axios');

module.exports.config = {
    name: 'meta',
    version: '1.0.0',
    role: 0,
    hasPrefix: false,
    aliases: ['meta'],
    description: 'Interact Llma',
    usage: 'meta [question]',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const question = args.join(' ');

    if (!question) {
        return api.sendMessage('Please provide a question, for example: meta what is the meaning of life?', event.threadID, event.messageID);
    }

    const initialMessage = await new Promise((resolve, reject) => {
        api.sendMessage('𝙼𝚎𝚝𝚊 𝙻𝚕𝚖𝚊 𝚆𝚛𝚒𝚝𝚒𝚗𝚐...', event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        });
    });

    try {
        const response = await axios.get('https://hiroshi-rest-api.replit.app/ai/llama', {
            params: { ask: question }
        });
        const aiResponse = response.data;
        const responseString = aiResponse.response ? aiResponse.response : 'No result found.';

        const formattedResponse = `
💪 | 𝙼𝙴𝚃𝙰 𝙰𝙸
━━━━━━━━━━━━━━━━━━
Question: ${question}
━━━━━━━━━━━━━━━━━━
𝙼𝙴𝚃𝙰 𝚂𝙰𝙸𝙳 - ${responseString}
━━━━━━━━━━━━━━━━━━
        `;

        await api.editMessage(formattedResponse.trim(), initialMessage.messageID);

    } catch (error) {
        console.error('Error:', error);
        await api.editMessage('An error occurred, please try again later.', initialMessage.messageID);
    }
};
