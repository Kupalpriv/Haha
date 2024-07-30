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
        return api.sendMessage('Please provide a question, for example: ai what is chilli?', event.threadID, event.messageID);
    }

    const initialMessage = await new Promise((resolve, reject) => {
        api.sendMessage('💀 𝙰𝙽𝚂𝚆𝙴𝚁𝙸𝙽𝙶...', event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        });
    });

    try {
        const response = await axios.get('https://markdevs-last-api-2epw.onrender.com/api/v3/gpt4', {
            params: { ask: question }
        });
        const aiResponse = response.data;
        const responseString = aiResponse.answer ? aiResponse.answer : 'No result found.';

        const formattedResponse = `
🤯 𝙰𝙸 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝙶𝙿𝚃4
━━━━━━━━━━━━━━━━━━
${responseString}
━━━━━━━━━━━━━━━━━━
𝚆𝚊𝚐 𝚖𝚘 𝚔𝚘𝚙𝚢𝚊𝚑𝚒𝚗 𝚕𝚊𝚑𝚊𝚝 𝚗𝚐 𝚜𝚊𝚐𝚘𝚝
𝚔𝚞𝚗𝚐 𝚊𝚢𝚊𝚠 𝚖𝚘 𝚖𝚊𝚑𝚊𝚕𝚊𝚝𝚊.
-𝙲𝚑𝚞𝚛𝚌𝚑𝚒𝚕𝚕 𝚙𝚘𝚐𝚒
        `;

        await api.editMessage(formattedResponse.trim(), initialMessage.messageID);

    } catch (error) {
        console.error('Error:', error);
        await api.editMessage('An error occurred, please try using the "ai2" command.', initialMessage.messageID);
    }
};
