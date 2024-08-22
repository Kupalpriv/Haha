const axios = require('axios');

module.exports.config = {
    name: 'ai2',
    version: '1.0.0',
    role: 0,
    hasPrefix: false,
    aliases: ['ai2'],
    description: 'Interact with the Hercai AI',
    usage: 'ai2 [question]',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const question = args.join(' ');

    if (!question) {
        return api.sendMessage('Please provide a question, for example: ai2 what is love?', event.threadID, event.messageID);
    }

    const initialMessage = await new Promise((resolve, reject) => {
        api.sendMessage({
            body: '🤖 Ai answering...',
            mentions: [{ tag: event.senderID, id: event.senderID }],
        }, event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        }, event.messageID);
    });

    try {
        const response = await axios.get('https://hercai.onrender.com/v3/hercai', {
            params: { question }
        });
        const aiResponse = response.data;
        const responseString = aiResponse.reply ? aiResponse.reply : 'No result found.';

        const formattedResponse = `
🤖 Hercai AI
━━━━━━━━━━━━━━━━━━
${responseString}
━━━━━━━━━━━━━━━━━━
-𝚆𝙰𝙶 𝙼𝙾 𝙲𝙾𝙿𝚈 𝙻𝙰𝙷𝙰𝚃 𝙽𝙶 𝚂𝙰𝙶𝙾𝚃 𝙺𝚄𝙽𝙶 𝙰𝚈𝙰𝚆 𝙼𝙾𝙽𝙶 𝙼𝙰𝙷𝙰𝙻𝙰𝚃𝙰
━━━━━━━━━━━━━━━━━━
If you want to donate for the server, just PM or Add the developer: [https://www.facebook.com/Churchill.Dev4100]
        `;

        await api.editMessage(formattedResponse.trim(), initialMessage.messageID);

    } catch (error) {
        console.error('Error:', error);
        await api.editMessage('An error occurred, please try again later.', initialMessage.messageID);
    }
};
