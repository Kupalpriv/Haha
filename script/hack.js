const axios = require('axios');

module.exports.config = {
    name: 'hack',
    version: '1.0.0',
    role: 0,
    hasPrefix: false,
    aliases: [],
    description: 'Pretend to hack a user by mentioning them or replying to their message.',
    usage: 'hack [mention] or reply to a message',
    credits: 'chilli',
    cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
    let targetUser;

    // Check if the user is mentioned or if this is a reply
    if (Object.keys(event.mentions).length > 0) {
        targetUser = {
            name: event.mentions[Object.keys(event.mentions)[0]].replace('@', ''),
            uid: Object.keys(event.mentions)[0],
        };
    } else if (event.messageReply && event.messageReply.senderID) {
        targetUser = {
            name: event.messageReply.senderID, // Replace with real name logic if necessary
            uid: event.messageReply.senderID,
        };
    } else {
        return api.sendMessage('Please mention or reply to someone to hack!', event.threadID, event.messageID);
    }

    // Hack API URL
    const apiUrl = `https://api-canvass.vercel.app/hack?name=${encodeURIComponent(targetUser.name)}&uid=${targetUser.uid}`;

    // Sending an initial message
    api.sendMessage(`Hacking ${targetUser.name}... Please wait!`, event.threadID, () => {}, event.messageID);

    try {
        const response = await axios.get(apiUrl);

        // Simulate a result message with data from the API
        api.sendMessage(
            `Successfully hacked ${targetUser.name}! 🎉\n\nHacked Info:\n${response.data}`, 
            event.threadID, 
            event.messageID
        );
    } catch (error) {
        console.error('Error with hack API:', error);
        api.sendMessage('Failed to hack the user. Please try again later.', event.threadID, event.messageID);
    }
};
