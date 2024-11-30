const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { jonel } = require('../api');

module.exports.config = {
    name: 'ai',
    version: '1.0.4',
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
        api.sendMessage(' Generating your response...', event.threadID, (err, info) => {
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
            const tempPath = path.join(__dirname, 'tempImage.png');

            const writer = fs.createWriteStream(tempPath);
            const downloadStream = await axios({
                url: bossingUrl,
                method: 'GET',
                responseType: 'stream',
            });
            downloadStream.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            await api.sendMessage(
                {
                    attachment: fs.createReadStream(tempPath),
                },
                event.threadID,
                event.messageID
            );

            fs.unlinkSync(tempPath);
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
