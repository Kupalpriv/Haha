const axios = require('axios');

module.exports.config = {
    name: 'ai',
    version: '1.0.0',
    role: 0,
    hasPrefix: false,
    aliases: ['ai'],
    description: 'Interact with GPT-4 AI',
    usage: 'ai [question]',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const question = args.join(' ');

    if (!question) {
        return api.sendMessage('Please provide a question, for example: ai what is the meaning of life?', event.threadID, event.messageID);
    }

    const initialMessage = await new Promise((resolve, reject) => {
        api.sendMessage('𝙰𝚒 𝚊𝚗𝚜𝚠𝚎𝚛𝚒𝚗𝚐...', event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        });
    });

    try {
        const response = await axios.get('https://markdevs-last-api-2epw.onrender.com/gpt4', {
            params: { prompt: question, uid: 1 }
        });
        const aiResponse = response.data;
        const responseString = aiResponse.gpt4 ? aiResponse.gpt4 : 'No result found.';

        const formattedResponse = `
🤖 𝙶𝙿𝚃4+ 𝙲𝙾𝙽𝚃𝙸𝙽𝚄𝙴𝚂 𝙰𝙸
━━━━━━━━━━━━━━━━━━
${responseString}
━━━━━━━━━━━━━━━━━━
𝚃𝚈𝙿𝙴 "ai 𝙲𝙻𝙴𝙰𝚁 𝙲𝙾𝙽𝚅𝙾" 𝚃𝙾 𝙲𝙻𝙴𝙰𝚁 𝙲𝙾𝙽𝚅𝙴𝚁𝚂𝙰𝚃𝙸𝙾𝙽
        `;

        await api.editMessage(formattedResponse.trim(), initialMessage.messageID);

    } catch (error) {
        console.error('Error:', error);
        await api.editMessage('An error occurred, please try using the "ai2" command.', initialMessage.messageID);
    }
};
