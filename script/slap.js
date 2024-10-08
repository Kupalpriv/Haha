const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: 'slap',
    version: '1.0.2',
    role: 0,
    hasPrefix: false,
    aliases: ['slap'],
    description: 'Slap someone with a custom image.',
    usage: 'slap @mention or slap reply',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    let targetID;
    if (event.type === 'message_reply') {
        targetID = event.messageReply.senderID;
    } else {
        if (event.mentions && Object.keys(event.mentions).length > 0) {
            targetID = Object.keys(event.mentions)[0];
        } else {
            return api.sendMessage('Please mention someone to slap, or use the command in reply to a message.', event.threadID, event.messageID);
        }
    }

    const userID = event.senderID;
    const senderName = (await api.getUserInfo(userID))[userID].name;
    const targetName = (await api.getUserInfo(targetID))[targetID].name;

    const imageUrl = `https://api-canvass.vercel.app/slap?batman=${userID}&superman=${targetID}`;
    const filePath = path.resolve(__dirname, 'slap.png');

    try {
        const response = await axios({
            url: imageUrl,
            responseType: 'stream',
        });

        response.data.pipe(fs.createWriteStream(filePath));

        response.data.on('end', async () => {
            await api.sendMessage({
                body: `${senderName} slapped ${targetName}! 👋`,
                attachment: fs.createReadStream(filePath),
            }, event.threadID, () => {
                fs.unlinkSync(filePath);
            }, event.messageID);
        });

    } catch (error) {
        console.error('Error:', error);
        api.sendMessage('An error occurred while generating the slap image. Please try again later.', event.threadID, event.messageID);
    }
};
