const axios = require('axios');

module.exports.config = {
    name: 'ai',
    version: '1.0.0',
    role: 0,
    hasPrefix: false,
    aliases: ['ai'],
    description: 'Interact with the MythoMax-L2-13b model via text prompts',
    usage: 'ai [custom prompt]',
    credits: 'chilli',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const customPrompt = args.join(' ');

    if (!customPrompt) {
        return api.sendMessage('Please provide a question ex: ai what is love.', event.threadID, event.messageID);
    }

    const apiUrl = `https://www.samirxpikachu.run.place/multi/Ml?prompt=${encodeURIComponent(customPrompt)}&model=MythoMax-L2-13b`;

    const initialMessage = await new Promise((resolve, reject) => {
        api.sendMessage({
            body: '🔍 𝙼𝚢𝚃𝚑𝚘𝙼𝚊𝚡 is processing your request...',
            mentions: [{ tag: event.senderID, id: event.senderID }],
        }, event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        }, event.messageID);
    });

    try {
        const response = await axios.get(apiUrl);

        if (response.data && response.data.result) {
            const aiResponse = response.data.result.trim();

            const formattedResponse = `
✨ 𝙼𝚢𝚃𝚑𝚘𝙼𝚊𝚡 𝚁𝚎𝚜𝚙𝚘𝚗𝚜𝚎
━━━━━━━━━━━━━━━━━━
${aiResponse}
━━━━━━━━━━━━━━━━━━
-𝙲𝚑𝚒𝚕𝚕𝚒 𝙼𝚊𝚗𝚜𝚒
            `;

            await api.editMessage(formattedResponse.trim(), initialMessage.messageID);
        } else {
            throw new Error('Invalid response from AI API.');
        }

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        await api.editMessage('An error occurred, please try to use ai2.', initialMessage.messageID);
    }
};
