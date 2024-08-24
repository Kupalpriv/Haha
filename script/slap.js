const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: 'slap',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: [],
    description: 'Slap someone by mentioning them or replying to their message',
    usage: 'slap @user or reply to a message with !slap',
    credits: 'chill',
    cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
    let uid, uid2;

    // Check if the message is a reply
    if (event.messageReply) {
        uid2 = event.messageReply.senderID; // User being replied to
        uid = event.senderID; // User who sent the slap command
    } else {
        // Extract mentions from the message
        const mentions = Object.keys(event.mentions);
        
        if (mentions.length === 0) {
            return api.sendMessage('Please mention someone to slap or reply to their message.', event.threadID, event.messageID);
        }

        uid = event.senderID; // User who sent the slap command
        uid2 = mentions[0]; // First mentioned user
    }

    try {
        // Fetch user information
        const userInfo = await api.getUserInfo([uid, uid2]);
        const slapperName = userInfo[uid].name; // Name of the slapper
        const slappedName = userInfo[uid2].name; // Name of the slapped person

        const apiUrl = `https://deku-rest-api.gleeze.com/canvas/slap?uid=${uid}&uid2=${uid2}`;
        const response = await axios({
            url: apiUrl,
            method: 'GET',
            responseType: 'arraybuffer'
        });

        const buffer = Buffer.from(response.data, 'binary');
        const filePath = path.resolve(__dirname, 'slap.png');
        fs.writeFileSync(filePath, buffer);

        await api.sendMessage(
            {
                body: `${slapperName} has slapped ${slappedName}! Here is the slap image:`,
                attachment: fs.createReadStream(filePath)
            },
            event.threadID,
            () => {
                fs.unlinkSync(filePath);
            },
            event.messageID
        );

    } catch (error) {
        console.error('Error creating slap image:', error);
        api.sendMessage('Failed to generate the slap image. Please try again later.', event.threadID, event.messageID);
    }
};
