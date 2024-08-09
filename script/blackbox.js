const axios = require('axios');

module.exports.config = {
    name: 'blackbox',
    version: '1.0.0',
    role: 0,
    hasPrefix: false,
    aliases: ['blackbox', 'bb'],
    description: 'Interact with Blackbox AI',
    usage: 'blackbox [question]',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const prompt = args.join(' ');

    if (!prompt) {
        return api.sendMessage('Please provide a question, for example: blackbox what is the meaning of life?', event.threadID, event.messageID);
    }

    const responseMessage = await new Promise((resolve, reject) => {
        // Send the initial "thinking" message as a reply to the user's message
        api.sendMessage({
            body: '🔄 Searching, please wait...',
            mentions: [{ tag: event.senderID, id: event.senderID }],
        }, event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        }, event.messageID); // Make it a reply to the user's message
    });

    try {
        const response = await axios.get('https://ggwp-yyxy.onrender.com/blackbox', {
            params: { prompt: prompt }
        });
        const result = response.data;
        const responseString = result.data ? result.data : 'No result found.';

        const formattedResponse = `
📦 𝙱𝙻𝙰𝙲𝙺𝙱𝙾𝚇
━━━━━━━━━━━━━━━━━━
${responseString}
━━━━━━━━━━━━━━━━━━
𝚆𝙰𝙶 𝙼𝙾 𝙲𝙾𝙿𝚈 𝙻𝙰𝙷𝙰𝚃 𝙽𝙶 𝚂𝙰𝙶𝙾𝚃
-𝙲𝚑𝚞𝚛𝚌𝚑𝚒𝚕𝚕
        `;

        
        await api.editMessage(formattedResponse.trim(), responseMessage.messageID);

    } catch (error) {
        console.error('Error:', error);
        await api.editMessage('An error occurred while fetching the response.', responseMessage.messageID);
    }
};
