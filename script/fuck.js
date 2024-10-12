const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: 'fuck',
    version: '1.0.0',
    role: 0,
    hasPrefix: false,
    aliases: ['fck'],
    description: 'Generate a fuck image between two users.',
    usage: 'fuck [mention]',
    credits: 'chilli',
    cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
    const ownerUID = '100087212564100';
    let mentionedUser;

    if (Object.keys(event.mentions).length > 0) {
        mentionedUser = Object.keys(event.mentions)[0];
    } else if (event.messageReply && event.messageReply.senderID) {
        mentionedUser = event.messageReply.senderID;
    } else {
        return api.sendMessage('Please mention or reply to a user’s message to use this command.', event.threadID, event.messageID);
    }

    if (mentionedUser === ownerUID) {
        return api.sendMessage(`Fuck urself obo ka!`, event.threadID, event.messageID);
    }

    try {
        // Get the names of the sender and the mentioned user
        const senderName = (await api.getUserInfo(event.senderID))[event.senderID].name;
        const mentionedName = (await api.getUserInfo(mentionedUser))[mentionedUser].name;

        const apiUrl = `https://api-canvass.vercel.app/fuck?one=${event.senderID}&two=${mentionedUser}`;

        const response = await axios({
            method: 'GET',
            url: apiUrl,
            responseType: 'stream',
        });

        const fileName = `fuck_${event.senderID}_${mentionedUser}.png`;
        const filePath = path.join(__dirname, fileName);
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        writer.on('finish', async () => {
            await api.sendMessage({
                body: `💥 ${senderName} fucked ${mentionedName}!`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, event.messageID);
            fs.unlinkSync(filePath);
        });

        writer.on('error', () => {
            api.sendMessage('There was an error creating the fuck image. Please try again later.', event.threadID, event.messageID);
        });
    } catch (error) {
        console.error('Error fetching fuck image or names:', error);
        api.sendMessage('An error occurred while generating the image or fetching the names. Please try again later.', event.threadID, event.messageID);
    }
};
