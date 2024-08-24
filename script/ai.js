const axios = require('axios');

module.exports.config = {
    name: 'ai',
    version: '1.0.2',
    role: 0,
    hasPrefix: false,
    aliases: ['ask'],
    description: 'Interact with the MythoMax AI',
    usage: 'ai [question]',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const question = args.join(' ');

    if (!question) {
        return api.sendMessage('Please provide a question, for example: ask what is love?', event.threadID, event.messageID);
    }

    const initialMessage = await new Promise((resolve, reject) => {
        api.sendMessage({
            body: '𝙿𝚛𝚘𝚌𝚎𝚜𝚜𝚒𝚗𝚐...',
            mentions: [{ tag: event.senderID, id: event.senderID }],
        }, event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        }, event.messageID);
    });

    try {
        const response = await axios.get('https://www.samirxpikachu.run.place/multi/Ml', {
            params: { prompt: question, model: 'MythoMax-L2-13b' }
        });

        const aiResponse = response.data.trim(); // Trim any leading/trailing whitespace
        const responseString = aiResponse ? aiResponse : 'No result found.';

        const formattedResponse = 
`☠️ 𝙼𝚢𝚝𝚑𝚘𝙼𝚊𝚡 𝚁𝚎𝚜𝚙𝚘𝚗𝚜𝚎
━━━━━━━━━━━━━━━━━━
${responseString}
━━━━━━━━━━━━━━━━━━
- 𝙼𝚢𝚝𝚑 𝙺𝚞𝚗`;

        await api.editMessage(formattedResponse, initialMessage.messageID);

    } catch (error) {
        console.error('Error:', error);
        await api.editMessage('An error occurred, please try use ai2.', initialMessage.messageID);
    }
};
