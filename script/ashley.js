const axios = require('axios');
const { markApi } = require('../api'); 

module.exports.config = {
    name: 'ashley',
    version: '1.0.0',
    role: 0,
    hasPrefix: false,
    aliases: ['ash'],
    description: 'Get a response from Ashley API',
    usage: 'ashley [your message]',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const pogi = event.senderID;
    const chilli = args.join(' ');

    if (!chilli) {
        return api.sendMessage('Please provide a prompt, for example: ashley How are you?', event.threadID, event.messageID);
    }

    // Send a typing indicator
    const pangit = await new Promise((resolve, reject) => {
        api.sendMessage('⏳ Ashley is typing, please wait...', event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        }, event.messageID);
    });

    const apiUrl = `${markApi}/new/api/ashley?query=${encodeURIComponent(chilli)}`;

    try {
        const response = await axios.get(apiUrl);
        const ashleyResponse = response.data.result || 'No response from Ashley.';

        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const formattedResponse = 
`💬 | 𝘼𝙨𝙝𝙡𝙚𝙮'𝙨 𝙍𝙚𝙥𝙡𝙮
━━━━━━━━━━━━━━━━━━
${ashleyResponse}
━━━━━━━━━━━━━━━━━━
⏰ Response time: ${currentTime}`;

        await api.editMessage(formattedResponse, pangit.messageID);

    } catch (maasim) {
        console.error('Error:', maasim);
        await api.editMessage('❌ An error occurred. Please try again later.', pangit.messageID);
    }
};
