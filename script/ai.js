const axios = require('axios');
const { jonel } = require('../api');

module.exports.config = {
    name: 'ai',
    version: '1.0.2',
    role: 0,
    hasPrefix: false,
    aliases: ['gpt4'],
    description: 'Get a response from GPT-4 (text or image)',
    usage: 'ai [your message]',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
    const pogi = event.senderID;
    const chilli = args.join(' ');

    if (!chilli) {
        return api.sendMessage('Please provide a prompt, for example: ai Draw me a cute dog.', event.threadID, event.messageID);
    }

    const kupal = await api.getUserInfo(pogi);
    const bossing = kupal[pogi].name;

    const loading = await new Promise((resolve, reject) => {
        api.sendMessage('🔍 Generating your response...', event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        }, event.messageID);
    });

    const pogiUrl = `${jonel}/api/gpt4o-v2?prompt=${encodeURIComponent(chilli)}`;

    try {
        const response = await axios.get(pogiUrl);
        const kupalResponse = response.data.response || 'No response from the AI.';

        const pogiMatch = kupalResponse.match(/\!\[.*\]\((https?:\/\/.*\.(?:png|jpg|jpeg|gif))\)/);
        if (pogiMatch) {
            const bossingUrl = pogiMatch[1];
            const bossingPath = `./ai_generated_image_${Date.now()}.png`;

            const kupalResponse = await axios({
                url: bossingUrl,
                method: 'GET',
                responseType: 'stream',
            });

            const pogiWriter = require('fs').createWriteStream(bossingPath);
            kupalResponse.data.pipe(pogiWriter);

            await new Promise((resolve, reject) => {
                pogiWriter.on('finish', resolve);
                pogiWriter.on('error', reject);
            });

            await api.sendMessage(
                {
                    attachment: require('fs').createReadStream(bossingPath),
                },
                event.threadID,
                event.messageID
            );

            require('fs').unlinkSync(bossingPath);
        } else {
            const formattedResponse = 
`🧩 | Chilli AI
━━━━━━━━━━━━━━━━━━
${kupalResponse}
━━━━━━━━━━━━━━━━━━
👤 Asked by: ${bossing}`;

            await api.editMessage(formattedResponse, loading.messageID);
        }
    } catch (pogiError) {
        console.error('Error:', pogiError);
        await api.editMessage('An error occurred. Please try again later.', loading.messageID);
    }
};
