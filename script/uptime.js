const fs = require('fs');
const path = require('path');

const uptimeFilePath = path.join(__dirname, 'uptime.json');

if (!fs.existsSync(uptimeFilePath)) {
    const initialData = { startTime: Date.now() };
    fs.writeFileSync(uptimeFilePath, JSON.stringify(initialData));
}

module.exports.config = {
    name: 'uptime',
    version: '1.0.0',
    role: 0,
    credits: 'Churchill',
    description: 'Displays the bot\'s live uptime.',
    hasPrefix: true,
    aliases: ['up', 'runtime'],
    usage: '',
    cooldown: 5,
};

module.exports.run = async function({ api, event }) {
    try {
        const uptimeData = JSON.parse(fs.readFileSync(uptimeFilePath));
        const startTime = uptimeData.startTime;

        const currentTime = Date.now();
        const uptimeInSeconds = (currentTime - startTime) / 1000;
        const formattedUptime = timeFormat(uptimeInSeconds);

        api.sendMessage(`🕒 Bot Uptime: ${formattedUptime}`, event.threadID);
    } catch (error) {
        console.error('Error fetching uptime:', error);
        api.sendMessage('❌ An error occurred while fetching the uptime.', event.threadID);
    }

    function timeFormat(seconds) {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        let result = '';
        if (days > 0) result += `${days} day${days > 1 ? 's' : ''} `;
        if (hours > 0) result += `${hours} hour${hours > 1 ? 's' : ''} `;
        if (minutes > 0) result += `${minutes} minute${minutes > 1 ? 's' : ''} `;
        result += `${secs} second${secs > 1 ? 's' : ''}`;
        return result.trim();
    }
};
