const axios = require('axios');

module.exports.config = {
    name: 'gemini',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: ['gemini'],
    description: 'Interact with the Gemini AI',
    usage: 'gemini [custom prompt] (attach image or not)',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const attachment = event.messageReply?.attachments[0] || event.attachments[0];
    const customPrompt = args.join(' ');

    if (!customPrompt && !attachment) {
        return api.sendMessage('Please provide a prompt or attach a photo for the Gemini to analyze.', event.threadID, event.messageID);
    }

    let apiUrl = 'https://deku-rest-api.gleeze.com/gemini?';

    if (attachment && attachment.type === 'photo') {
        const prompt = customPrompt || 'Anwer this photo';
        const imageUrl = attachment.url;
        apiUrl += `prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(imageUrl)}`;
    } else {
        apiUrl += `prompt=${encodeURIComponent(customPrompt)}`;
    }

    const initialMessage = await new Promise((resolve, reject) => {
        api.sendMessage({
            body: '🔍 Processing your request...',
            mentions: [{ tag: event.senderID, id: event.senderID }],
        }, event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        }, event.messageID);
    });

    try {
        const response = await axios.get(apiUrl);
        const aiResponse = response.data.gemini;

        const formattedResponse = `
✨ 𝙶𝚎𝚖𝚒𝚗𝚒 𝚁𝚎𝚜𝚙𝚘𝚗𝚜𝚎
━━━━━━━━━━━━━━━━━━
${aiResponse.trim()}
━━━━━━━━━━━━━━━━━━
-𝙲𝚑𝚒𝚕𝚕𝚒 𝙼𝚊𝚗𝚜𝚒
        `;

        await api.editMessage(formattedResponse.trim(), initialMessage.messageID);

    } catch (error) {
        console.error('Error:', error);
        let errorMessage = 'An error occurred, could not process your request.';
        if (error.response && error.response.data) {
            errorMessage += `\nDetails: ${error.response.data.message || 'Unknown error'}`;
        }

        await api.editMessage(errorMessage, initialMessage.messageID);
    }
};
