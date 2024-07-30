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
    const bulag = args.join(' ');

    if (!bulag) {
        return api.sendMessage('Please provide a question, for example: blackbox what is the meaning of life?', event.threadID, event.messageID);
    }

    const initialMessage = await new Promise((resolve, reject) => {
        api.sendMessage('🔄 Searching, please wait...', event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        });
    });

    try {
        const response = await axios.get('https://markdevs-last-api-2epw.onrender.com/api/box', {
            params: { query: bulag }
        });

        const mapanghi = response.data;
        const responseString = mapanghi.response ? mapanghi.response : 'No result found.';

        const formattedResponse = `
📦 𝙱𝙾𝚇+ 𝙲𝙾𝙽𝚅𝙴𝚁𝚂𝙰𝚃𝙸𝙾𝙽𝙰𝙻
━━━━━━━━━━━━━━━━━━
${responseString}
━━━━━━━━━━━━━━━━━━
𝚃𝚈𝙿𝙴 "𝙲𝙻𝙴𝙰𝚁 𝙲𝙾𝙽𝚅𝙾" 𝚃𝙾 𝙲𝙻𝙴𝙰𝚁 𝙲𝙾𝙽𝚅𝙾𝚁𝚂𝙰𝚃𝙸𝙾𝙽
        `;

        await api.editMessage(formattedResponse.trim(), initialMessage.messageID);

    } catch (error) {
        console.error('Error:', error);
        await api.editMessage('An error occurred while fetching the response.', initialMessage.messageID);
    }
};
