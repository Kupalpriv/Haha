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
            mentions: [{ tag: lubot, id: pogi }],
        }, event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        }, event.messageID);
    });

    api.setMessageReaction('⏳', event.messageID, (err) => {
        if (err) console.error('Error reacting with loading emoji:', err);
    });

    const apiUrl = `https://markdevs-last-api-2epw.onrender.com/api/v3/gpt4?ask=${encodeURIComponent(chilli)}`;

    try {
        const response = await axios.get(apiUrl);
        const gpt4Response = response.data.answer || 'No response from GPT-4.';

        const formattedResponse = 
` 🧩 | 𝘾𝙝𝙞𝙡𝙡𝙞 𝙂𝙥𝙩
━━━━━━━━━━━━━━━━━━
${gpt4Response}
━━━━━━━━━━━━━━━━━━
👤 𝙰𝚜𝚔𝚎𝚍 𝚋𝚢: ${lubot}`;

        // Mag-unsend ng naunang "Answering plss wait..." message
        await api.unsendMessage(pangit.messageID);

        // Mag-send ng bagong message para sa GPT-4 response
        await api.sendMessage(formattedResponse, event.threadID);

        api.setMessageReaction('✅', event.messageID, (err) => {
            if (err) console.error('Error reacting with check emoji:', err);
        });

    } catch (maasim) {
        console.error('Error:', maasim);
        await api.sendMessage('An error occurred plss try to use "ai2" or try again later', event.threadID);

        api.setMessageReaction('', event.messageID, (err) => {
            if (err) console.error('Error removing loading emoji:', err);
        });
    }
};
