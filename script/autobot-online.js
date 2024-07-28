const axios = require('axios');

module.exports.config = {
    name: "autobot-online",
    version: "1.0.0",
    role: 0,
    credits: "chill",
    description: "Fetch and display online users from the autobot website",
    hasPrefix: false,
    aliases: ["autobot-online"],
    usage: "autobot-online",
    cooldown: 5
};

module.exports.run = async function({ api, event }) {
    try {
        const response = await axios.get('https://hahap.onrender.com/info');
        const data = response.data;

        if (data.length === 0) {
            api.sendMessage("No users are currently online.", event.threadID);
            return;
        }

        let message = '💤 | 𝙰𝚄𝚃𝙾𝙱𝙾𝚃 𝙾𝙽𝙻𝙸𝙽𝙴\n━━━━━━━━━━━━━━━━━━\n';
        
        data.forEach(user => {
            message += `👤 ${user.name}\n🔗 [Profile](${user.profileUrl})\n⏱ Uptime: ${timeFormat(user.time)}\n\n`;
        });

        message += '━━━━━━━━━━━━━━━━━━\n';

        api.sendMessage(message, event.threadID);

    } catch (error) {
        console.error('Error:', error);
        api.sendMessage("An error occurred while fetching the online users.", event.threadID);
    }
};

function timeFormat(currentTime) {
    const days = Math.floor(currentTime / (3600 * 24));
    const hours = Math.floor((currentTime % (3600 * 24)) / 3600);
    const minutes = Math.floor((currentTime % 3600) / 60);
    const seconds = currentTime % 60;

    let timeFormat = '';

    if (days > 0) timeFormat += `${days} day${days > 1 ? 's' : ''} `;
    if (hours > 0) timeFormat += `${hours} hour${hours > 1 ? 's' : ''} `;
    if (minutes > 0) timeFormat += `${minutes} minute${minutes > 1 ? 's' : ''} `;
    timeFormat += `${seconds} second${seconds > 1 ? 's' : ''}`;

    return timeFormat.trim();
}
