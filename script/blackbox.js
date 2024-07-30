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
📦 𝙱𝙻𝙰𝙲𝙺𝙱𝙾𝚇 𝙰i
━━━━━━━━━━━━━━━━━━
${responseString}
━━━━━━━━━━━━━━━━━━
-𝙲𝙷𝚄𝚁𝙲𝙷𝙸𝙻𝙻𝙸
        `;

        await api.editMessage(formattedResponse.trim(), initialMessage.messageID);

    } catch (error) {
        console.error('Error:', error);
        await api.editMessage('An error occurred while fetching the response.', initialMessage.messageID);
    }
};
