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
            body: '𝙿𝚛𝚘𝚌𝚎𝚜𝚜𝚒𝚗𝚐...',
            mentions: [{ tag: lubot, id: pogi }],
        }, event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        }, event.messageID);
    });

    api.setMessageReaction('⏳', event.messageID, (err) => {
        if (err) console.error('Error reacting with loading emoji:', err);
    });

    const apiUrl = `https://deku-rest-api.gleeze.com/gpt4?prompt=${encodeURIComponent(chilli)}&uid=${pogi}`;

    try {
        const response = await axios.get(apiUrl);
        const gpt4Response = response.data.gpt4 || 'No response from GPT-4.';

        const formattedResponse = 
` 𝙶𝚙𝚝4++ 𝙲𝚘𝚗𝚝𝚒𝚗𝚞𝚎𝚜
━━━━━━━━━━━━━━━━━━
${gpt4Response}
━━━━━━━━━━━━━━━━━━
👤 𝙰𝚜𝚔𝚎𝚍 𝚋𝚢: ${lubot}`;

        await api.editMessage(formattedResponse, pangit.messageID);

        api.setMessageReaction('✅', event.messageID, (err) => {
            if (err) console.error('Error reacting with check emoji:', err);
        });

    } catch (maasim) {
        console.error('Error:', maasim);
        await api.editMessage('An error occurred while getting a response from GPT-4. Please try again later.', pangit.messageID);

        api.setMessageReaction('', event.messageID, (err) => {
            if (err) console.error('Error removing loading emoji:', err);
        });
    }
};
