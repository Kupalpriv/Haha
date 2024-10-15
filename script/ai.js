const axios = require('axios');

module.exports.config = {
    name: 'ai',
    version: '1.0.0',
    role: 0,
    hasPrefix: false,
    aliases: ['ai'],
    description: 'Ask a question to the AI using the provided API.',
    usage: 'ai <question>',
    credits: 'chilli',
    cooldown: 3,
};

module.exports.run = async function({ api, event }) {
    
    const userPrompt = event.body;
    
    if (!userPrompt) {
        return api.sendMessage('Please provide a question.', event.threadID, event.messageID);
    }

    const apiUrl = `https://markdevs69v2-679r.onrender.com/new/gpt4?query=${encodeURIComponent(userPrompt)}`;

    // Send initial "searching" message
    api.sendMessage(`🔍 Searching for: "${userPrompt}"... Please wait.`, event.threadID, (err, info) => {
        if (err) return console.error(err);

        const messageID = info.messageID; 

        axios.get(apiUrl)
            .then((response) => {
                const answer = response.data.response.respond;

            
                api.editMessage(answer, event.threadID, messageID, (err) => {
                    if (err) {
                        console.error('Error editing the message:', err);
                        api.sendMessage('Failed to update the message. Here is the response: ' + answer, event.threadID);
                    }
                });
            })
            .catch((error) => {
                console.error('Error fetching from API:', error);
                api.editMessage('There was an error fetching the information. Please try again later.', event.threadID, messageID, (err) => {
                    if (err) {
                        console.error('Error editing the message:', err);
                        api.sendMessage('There was an error fetching the information. Please try again later.', event.threadID);
                    }
                });
            });
    });
};
