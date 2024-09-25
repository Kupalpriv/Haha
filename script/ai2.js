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
    const userId = event.senderID;

    if (!question) {
        return api.sendMessage('Please provide a question, for example: ai2 what is love?', event.threadID, event.messageID);
    }

    const initialMessage = await new Promise((resolve, reject) => {
        api.sendMessage({
            body: '🤖 Ai answering...',
        }, event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        }, event.messageID);
    });

    try {
        const userInfo = await api.getUserInfo(userId);
        const userName = userInfo[userId].name;

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
👤 Asked by: ${userName}
        `;

        await api.unsendMessage(initialMessage.messageID);

        await api.sendMessage(formattedResponse.trim(), event.threadID, event.messageID);

    } catch (error) {
        console.error('Error:', error);
        
        await api.unsendMessage(initialMessage.messageID);

        await api.sendMessage('An error occurred, please try again later.', event.threadID, event.messageID);
    }
};
