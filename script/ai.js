const axios = require('axios');

module.exports.config = {
    name: 'ai',
    version: '1.0.1',
    role: 0,
    hasPrefix: false,
    aliases: ['gpt4'],
    description: 'Get a response from GPT-4',
    usage: 'ai [your message]',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const userID = event.senderID;
    const prompt = args.join(' ');

    if (!prompt) {
        return api.sendMessage('Please provide a prompt, for example: ai What is the meaning of life?', event.threadID, event.messageID);
    }

    // Get the name of the user who asked the question
    const userInfo = await api.getUserInfo(userID);
    const userName = userInfo[userID].name;

    // Send initial "Processing..." message
    const initialMessage = await new Promise((resolve, reject) => {
        api.sendMessage({
            body: '𝙿𝚛𝚘𝚌𝚎𝚜𝚜𝚒𝚗𝚐...',
            mentions: [{ tag: userName, id: userID }],
        }, event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        }, event.messageID);
    });

    const apiUrl = `https://deku-rest-api.gleeze.com/gpt4?prompt=${encodeURIComponent(prompt)}&uid=${userID}`;

    try {
        const response = await axios.get(apiUrl);
        const gpt4Response = response.data.gpt4 || 'No response from GPT-4.';

        // Format the response message
        const formattedResponse = 
`𝙶𝚙𝚝4 𝙲𝚘𝚗𝚝𝚒𝚗𝚞𝚎𝚜
━━━━━━━━━━━━━━━━━━
${gpt4Response}
━━━━━━━━━━━━━━━━━━
👤 𝙰𝚜𝚔𝚎𝚍 𝚋𝚢: ${userName}`;

        // Edit the initial message with the GPT-4 response
        await api.editMessage(formattedResponse, initialMessage.messageID);

    } catch (error) {
        console.error('Error:', error);
        await api.editMessage('An error occurred while getting a response from GPT-4. Please try again later.', initialMessage.messageID);
    }
};
