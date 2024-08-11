const axios = require('axios');

module.exports.config = {
    name: 'ai',
    version: '1.0.0',
    role: 0,
    hasPrefix: false,
    aliases: ['gemini'],
    description: 'Interact with the Gemini AI using a custom prompt, with or without an image',
    usage: 'ai [custom prompt] (attach image or not)',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args, Users }) {
    const attachment = event.messageReply?.attachments[0] || event.attachments[0];
    const customPrompt = args.join(' ');

    if (!customPrompt && !attachment) {
        return api.sendMessage('usage: ai what is love? or reply to image ex:gemini analyze this photo.', event.threadID, event.messageID);
    }

    let apiUrl = 'https://ggwp-yyxy.onrender.com/gemini?';

    if (attachment && attachment.type === 'photo') {
        const prompt = customPrompt || 'describe this photo';
        const imageUrl = attachment.url;
        apiUrl += `prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(imageUrl)}`;
    } else {
        apiUrl += `prompt=${encodeURIComponent(customPrompt)}`;
    }

    // Fetch the user's name from the Users database or event
    const senderID = event.senderID;
    const userInfo = await Users.getData(senderID);
    const senderName = userInfo.name || "Unknown";

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
        const aiResponse = response.data.gemini; // Accessing the "gemini" key directly

        const formattedResponse = `
✨ 𝙲𝚑𝚒𝚕𝚕𝚒 𝚁𝚎𝚜𝚙𝚘𝚗𝚜𝚎
━━━━━━━━━━━━━━━━━━
${aiResponse.trim()}
━━━━━━━━━━━━━━━━━━
👤 𝙰𝚜𝚔𝚎𝚍 𝚋𝚢: ${senderName}
        `;

        await api.editMessage(formattedResponse.trim(), initialMessage.messageID);

    } catch (error) {
        console.error('Error:', error);
        await api.editMessage('An error occurred, please try using "ai2".', initialMessage.messageID);
    }
};
