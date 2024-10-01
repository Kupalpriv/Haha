const axios = require('axios');

module.exports.config = {
    name: 'ai',
    version: '1.0.1',
    role: 0,
    hasPrefix: false,
    aliases: ['gpt4'],
    description: 'Get a response from GPT-4',
    usage: 'ai [your message]',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const pogi = event.senderID;
    const chilli = args.join(' ');

    if (!chilli) {
        return api.sendMessage('Please provide a prompt, for example: ai What is the meaning of life?', event.threadID, event.messageID);
    }

    const bayot = await api.getUserInfo(pogi);
    const lubot = bayot[pogi].name;

    const pangit = await new Promise((resolve, reject) => {
        api.sendMessage({
            body: '𝘼𝙣𝙨𝙬𝙚𝙧𝙞𝙣𝙜 𝙥𝙡𝙨𝙨 𝙬𝙖𝙞𝙩....',
        }, event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        }, event.messageID);
    });

    const apiUrl = `https://betadash-api-swordslush.vercel.app/gpt4?ask=${encodeURIComponent(chilli)}`;

    try {
        const response = await axios.get(apiUrl);
        const gpt4Response = response.data.content || 'No response from GPT-4.';

        const formattedResponse = 
`🧩 | 𝘾𝙝𝙞𝙡𝙡𝙞 𝙂𝙥𝙩
━━━━━━━━━━━━━━━━━━
${gpt4Response}
━━━━━━━━━━━━━━━━━━
👤 𝙰𝚜𝚔𝚎𝚍 𝚋𝚢: ${lubot}`;

        await api.editMessage(formattedResponse, pangit.messageID);

    } catch (maasim) {
        console.error('Error:', maasim);
        await api.editMessage('An error occurred. Please try again later.', pangit.messageID);
    }
};
