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

module.exports.run = async function({ api, event, args }) {
    if (args.length === 0) {
        return api.sendMessage('Please provide a question', event.threadID, event.messageID);
    }

    const userPrompt = args.join(' ');
    const apiUrl = `https://www.vertearth.cloud/api/gpt4?prompt=${encodeURIComponent(userPrompt)}`;

    api.sendMessage(`🔍 Searching for: "${userPrompt}"... Please wait.`, event.threadID, (err, info) => {
        if (err) return console.error(err);

        axios.get(apiUrl)
            .then((response) => {
                const answer = response.data.response.answer;
                api.editMessage(answer, info.messageID);
            })
            .catch((error) => {
                console.error('Error fetching from API:', error);
                api.editMessage('There was an error fetching the information. Please try again later.', info.messageID);
            });
    });
};
