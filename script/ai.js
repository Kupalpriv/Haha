const axios = require('axios');

module.exports.config = {
    name: 'ai',
    version: '1.0.2',
    role: 0,
    hasPrefix: false,
    aliases: ['ask'],
    description: 'Interact with the Mistral AI (7B)',
    usage: 'ai [question]',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args, Users }) {
    const question = args.join(' ');

    if (!question) {
        return api.sendMessage('Please provide a question, for example: ai what is love?', event.threadID, event.messageID);
    }

    // Add a loading reaction when the command is used
    await api.setMessageReaction('⏳', event.messageID, true);

    const initialMessage = await new Promise((resolve, reject) => {
        api.sendMessage({
            body: '𝙰𝚗𝚜𝚠𝚎𝚛𝚒𝚗𝚐 𝙿𝚕𝚜𝚜𝚜 𝚆𝚊𝚒𝚝...',
            mentions: [{ tag: event.senderID, id: event.senderID }],
        }, event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        }, event.messageID);
    });

    try {
        // Record the start time to calculate the response time
        const startTime = Date.now();

        // Fetch the user's name from the Users object
        const userName = await Users.getName(event.senderID);

        // Make the API request
        const response = await axios.get('https://www.samirxpikachu.run.place/multi/Ml', {
            params: { prompt: question, model: 'Mistral-7B-Instruct-v0.3' }
        });

        const aiResponse = response.data.trim(); // Trim any leading/trailing whitespace
        const responseString = aiResponse ? aiResponse : 'No result found.';

        // Calculate the response time
        const responseTime = Date.now() - startTime;
        const respondTimeString = `⏳ Respond time: ${responseTime}ms`;

        // Get the day of the week and current time
        const currentDate = new Date();
        const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
        const timeString = currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const formattedResponse = 
`💡 Mistral AI Response
━━━━━━━━━━━━━━━━━━
${responseString}
━━━━━━━━━━━━━━━━━━
👤 𝙰𝚜𝚔𝚎𝚍 𝙱𝚢: ${userName}

⏳ ${respondTimeString}
📅 Day: ${dayOfWeek}, Time: ${timeString}`;

        await api.editMessage(formattedResponse, initialMessage.messageID);

        // Change the reaction to a check mark when the response is ready
        await api.setMessageReaction('✅', event.messageID, true);

    } catch (error) {
        console.error('Error:', error);
        await api.editMessage('An error occurred, please try again later.', initialMessage.messageID);

        // Optionally, you could change the reaction to an error emoji if the response fails
        await api.setMessageReaction('❌', event.messageID, true);
    }
};
