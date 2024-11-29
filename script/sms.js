const axios = require('axios');
const { kenlie } = require('../api');

module.exports.config = {
    name: 'sms',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: ['text'],
    description: 'Send a free SMS using the LBC API.',
    usage: 'sms [number] | [message]',
    credits: 'churchill',
    cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
    const input = args.join(' ').split('|').map(item => item.trim());
    if (input.length < 2 || !input[0] || !input[1]) {
        return api.sendMessage(
            '⚠️ Please provide a phone number and a message separated by `|`.\n\n📌 Usage: sms number | message\nExample: sms 09123456789 | Hello World!',
            event.threadID,
            event.messageID
        );
    }

    const [number, message] = input;
    const apiUrl = `${kenlie}/freesmslbc/?number=${encodeURIComponent(number)}&message=${encodeURIComponent(message)}`;

    const initialMessage = await new Promise((resolve, reject) => {
        api.sendMessage('📨 Sending your SMS...', event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        }, event.messageID);
    });

    try {
        const response = await axios.get(apiUrl);
        const { status, response: apiResponse, sim_network, message_parts, message_remaining } = response.data;

        const formattedResponse = `
📝 **SMS Status**: ${status ? '✅ Sent Successfully' : '❌ Failed'}
━━━━━━━━━━━━━━━━━━
📱 **Number**: ${number}
📩 **Message**: ${message}
📡 **Network**: ${sim_network}
🗂️ **Parts**: ${message_parts}
🔄 **Remaining Messages**: ${message_remaining.toFixed(2)}
━━━━━━━━━━━━━━━━━━
        `.trim();

        await api.editMessage(formattedResponse, initialMessage.messageID);
    } catch (error) {
        console.error('Error sending SMS:', error);
        await api.editMessage(
            '❌ Failed to send SMS. Please try again later.',
            initialMessage.messageID
        );
    }
};
