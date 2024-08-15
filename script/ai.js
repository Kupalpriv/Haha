const axios = require('axios');

module.exports.config = {
    name: 'ai',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: ['gemini'],
    description: 'Interact with the Gemini',
    usage: 'ai [custom prompt] (attach image or not)',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const attachment = event.messageReply?.attachments[0] || event.attachments[0];
    const customPrompt = args.join(' ');

    if (!customPrompt && !attachment) {
        return api.sendMessage('Please provide a prompt or attach a photo for the AI to analyze.', event.threadID, event.messageID);
    }

    let apiUrl;
    
    if (attachment && attachment.type === 'photo') {
        // makakhandel ng image
        apiUrl = 'https://ggwp-yyxy.onrender.com/gemini?';
        const prompt = customPrompt || 'Answer the all need to answer';
        const imageUrl = attachment.url;
        apiUrl += `prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(imageUrl)}`;
    } else {
        // pag prompt na eto gagamitin
        apiUrl = `https://markdevs-last-api-as2j.onrender.com/gpt4?prompt=${encodeURIComponent(customPrompt)}&uid=${event.senderID}`;
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
        let aiResponse;

        if (attachment && attachment.type === 'photo') {
            aiResponse = response.data.gemini; // Accessing the "gemini" key for image processing
        } else {
            aiResponse = response.data; // Accessing the response directly for text processing
        }

        const formattedResponse = `
✨ 𝙲𝚑𝚒𝚕𝚕𝚒 𝚁𝚎𝚜𝚙𝚘𝚗𝚜𝚎
━━━━━━━━━━━━━━━━━━
${aiResponse.trim()}
━━━━━━━━━━━━━━━━━━
-𝙱𝚒𝚗𝚐 𝚌𝚑𝚒𝚕𝚕𝚒𝚗𝚐
        `;

        await api.editMessage(formattedResponse.trim(), initialMessage.messageID);

    } catch (error) {
        console.error('Error:', error);
        await api.editMessage('An error occurred, please try again or use the "ai2" command.', initialMessage.messageID);
    }
};
