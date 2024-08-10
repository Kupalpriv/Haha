const axios = require('axios');

module.exports.config = {
    name: 'ai', 
    version: '1.0.0',
    role: 0,
    hasPrefix: false,
    aliases: ['gemini'], 
    description: 'Interact',
    usage: 'ai [custom prompt] (attach image or not)',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args, Users }) {
    const attachment = event.messageReply?.attachments[0] || event.attachments[0];
    const customPrompt = args.join(' ');

    if (!customPrompt && !attachment) {
        return api.sendMessage('𝙿𝚕𝚎𝚊𝚜𝚎 𝙿𝚛𝚘𝚟𝚒𝚍𝚎 𝚊 𝚚𝚞𝚎𝚜𝚝𝚒𝚘𝚗 𝚎𝚡: ai pogi mo or reply to image', event.threadID, event.messageID);
    }

    let apiUrl = 'https://ggwp-yyxy.onrender.com/gemini?';

    if (attachment && attachment.type === 'photo') {
        const prompt = customPrompt || 'describe this photo';
        const imageUrl = attachment.url;
        apiUrl += `prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(imageUrl)}`;
    } else {
        apiUrl += `prompt=${encodeURIComponent(customPrompt)}`;
    }

    const startTime = Date.now(); 

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

        const responseTime = ((Date.now() - startTime) / 1000).toFixed(2); 

        const userName = (await Users.getName(event.senderID)) || 'Unknown User'; 

        const formattedResponse = `
✨ | 𝙲𝙷𝙸𝙻𝙻𝙸 𝚁𝙴𝚂𝙿𝙾𝙽𝚂𝙴
━━━━━━━━━━━━━━━━━━
${aiResponse.trim()}
━━━━━━━━━━━━━━━━━━
👤𝙰𝚜𝚔𝚎𝚍 𝚋𝚢: ${userName}
⏱️ 𝚁𝚎𝚜𝚙𝚘𝚗𝚍 𝚃𝚒𝚖𝚎: ${responseTime} 𝚂𝚎𝚌𝚘𝚗𝚍𝚜
        `;

        await api.editMessage(formattedResponse.trim(), initialMessage.messageID);

    } catch (error) {
        console.error('Error:', error);

        const errorMessage = `
❌ An error occurred while processing your request.
Please try using the \`ai2\` command.

👤𝙰𝚜𝚔𝚎𝚍 𝚋𝚢: ${(await Users.getName(event.senderID)) || 'Unknown User'}
        `;

        await api.editMessage(errorMessage.trim(), initialMessage.messageID);
    }
};
