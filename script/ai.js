const axios = require('axios');
const { jonel } = require('../api'); 

module.exports.config = {
    name: 'ai',
    version: '1.1.0',
    role: 0,
    hasPrefix: false,
    aliases: ['gpt4', 'ai-gen'],
    description: 'Get a response from GPT-4 or generate images.',
    usage: 'ai [your prompt]',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const senderID = event.senderID;
    const userPrompt = args.join(' ');

    if (!userPrompt) {
        return api.sendMessage('Please provide a question.', event.threadID, event.messageID);
    }

    const userInfo = await api.getUserInfo(senderID);
    const userName = userInfo[senderID].name;

    const initialMessage = await new Promise((resolve, reject) => {
        api.sendMessage(
            `🔍 :"${userPrompt}"...`,
            event.threadID,
            (err, info) => {
                if (err) return reject(err);
                resolve(info);
            },
            event.messageID
        );
    });

    const apiUrl = `${jonel}/api/gpt4o-v2?prompt=${encodeURIComponent(userPrompt)}`;

    try {
        const response = await axios.get(apiUrl);
        const gpt4Response = response.data.response || 'No response from GPT-4.';

        if (gpt4Response.startsWith('TOOL_CALL: generateImage')) {
            const imageUrlMatch = gpt4Response.match(/\((https?:\/\/[^\)]+)\)/);
            const imageUrl = imageUrlMatch ? imageUrlMatch[1] : null;

            if (imageUrl) {
                await api.sendMessage(
                    {
                        body: `🎨 Generated image for: "${userPrompt}"`,
                        attachment: await axios({
                            url: imageUrl,
                            method: 'GET',
                            responseType: 'stream',
                        }).then((res) => res.data),
                    },
                    event.threadID,
                    event.messageID
                );
            } else {
                throw new Error('Image URL not found in the response.');
            }
        } else {
            const formattedResponse = `
🧩 | Chilli Gpt
━━━━━━━━━━━━━━━━━━
${gpt4Response}
━━━━━━━━━━━━━━━━━━
👤 Asked by: ${userName}
            `;
            await api.editMessage(formattedResponse.trim(), initialMessage.messageID);
        }
    } catch (error) {
        console.error('Error:', error);
        await api.editMessage('An error occurred while processing your request. Please try again later.', initialMessage.messageID);
    }
};
