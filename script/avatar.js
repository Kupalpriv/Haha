const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { josh } = require('../api');

module.exports.config = {
    name: 'avatar',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: [],
    description: 'Generate avatar v2',
    usage: 'avatar <id> | <bgtext> | <signature> | <color>',
    credits: 'chill',
    cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
    const input = args.join(' ').split('|').map(item => item.trim());

    if (input.length < 4) {
        return api.sendMessage(
            'Please provide all required parameters in the format: avatar id1 to 800| bgtext | signature | color',
            event.threadID,
            event.messageID
        );
    }

    const [id, bgtext, signature, color] = input;
    const apiUrl = `${josh}/canvas/avatarv2?id=${encodeURIComponent(id)}&bgtext=${encodeURIComponent(bgtext)}&signature=${encodeURIComponent(signature)}&color=${encodeURIComponent(color)}`;

    try {
        const response = await axios({
            url: apiUrl,
            method: 'GET',
            responseType: 'arraybuffer'
        });

        const buffer = Buffer.from(response.data, 'binary');
        const filePath = path.resolve(__dirname, 'avatar.jpg');
        fs.writeFileSync(filePath, buffer);

        await api.sendMessage(
            {
                body: 'Here is your avatarv2:',
                attachment: fs.createReadStream(filePath)
            },
            event.threadID,
            () => {
                fs.unlinkSync(filePath);
            },
            event.messageID
        );

    } catch (error) {
        console.error('Error creating avatar:', error);
        api.sendMessage('Failed to generate the avatar. Please try again later.', event.threadID, event.messageID);
    }
};
