const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: 'kiss',
    version: '1.0.0',
    role: 0,
    hasPrefix: false,
    aliases: [],
    description: 'Generate a kiss image between two users.',
    usage: 'kiss [mention]',
    credits: 'chilli',
    cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
    let mentionedUser;

    // Check if a user is mentioned or if the command is used in reply
    if (Object.keys(event.mentions).length > 0) {
        mentionedUser = Object.keys(event.mentions)[0];
    } else if (event.messageReply && event.messageReply.senderID) {
        mentionedUser = event.messageReply.senderID;
    } else {
        return api.sendMessage('Please mention or reply to a user’s message to use this command.', event.threadID, event.messageID);
    }

    try {
        const apiUrl = `https://api-canvass.vercel.app/kiss2?one=${event.senderID}&two=${mentionedUser}`;

        const response = await axios({
            method: 'GET',
            url: apiUrl,
            responseType: 'stream',
        });

        const fileName = `kiss_${event.senderID}_${mentionedUser}.png`;
        const filePath = path.join(__dirname, fileName);
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        writer.on('finish', async () => {
            await api.sendMessage({
                attachment: fs.createReadStream(filePath)
            }, event.threadID, event.messageID);
            fs.unlinkSync(filePath);  // Delete the file after sending the image
        });

        writer.on('error', () => {
            api.sendMessage('There was an error creating the kiss image. Please try again later.', event.threadID, event.messageID);
        });
    } catch (error) {
        console.error('Error fetching kiss image:', error);
        api.sendMessage('An error occurred while generating the image. Please try again later.', event.threadID, event.messageID);
    }
};
