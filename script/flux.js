const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: 'flux',
    version: '1.0.0',
    role: 0,
    hasPrefix: false,
    aliases: [],
    description: 'Generate an image based on a given prompt using the Flux API.',
    usage: 'flux <prompt> [model 1-5]\n' +
           'Example without model: flux dog\n' +
           'Example with model: flux dog 5',
    credits: 'chilli',
    cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
    let prompt = args.slice(0, args.length - 1).join(' ');
    let model = args[args.length - 1];

    if (isNaN(model) || model < 1 || model > 5) {
        model = 4;
        prompt = args.join(' ');
    }

    if (event.body && !event.body.startsWith('flux ')) {
        return api.sendMessage(
            `Invalid command. Did you mean "flux"?\n\nUsage:\n` +
            `flux <prompt> [model 1-5]\n` +
            `Example without model: flux dog\n` +
            `Example with model: flux dog 5`, 
            event.threadID, 
            event.messageID
        );
    }

    if (!prompt.trim()) {
        return api.sendMessage(
            `Please provide a prompt to generate an image.\n\nUsage:\n` + 
            `flux <prompt> [model 1-5]\n` +
            `Example without model: flux dog\n` +
            `Example with model: flux dog 5`, 
            event.threadID, 
            event.messageID
        );
    }

    const apiUrl = `https://deku-rest-apis.ooguy.com/api/flux?prompt=${encodeURIComponent(prompt)}&model=${model}`;

    api.sendMessage('Generating image... Please wait.', event.threadID, (err, info) => {
        if (err) console.error('Error sending message:', err);
        const waitMessageID = info.messageID;

        try {
            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir);
            }

            const fileName = `flux_${Date.now()}.png`;
            const filePath = path.join(cacheDir, fileName);

            axios({
                method: 'GET',
                url: apiUrl,
                responseType: 'stream',
            }).then(response => {
                const writer = fs.createWriteStream(filePath);
                response.data.pipe(writer);

                writer.on('finish', async () => {
                    api.unsendMessage(waitMessageID);
                    await api.sendMessage({
                        attachment: fs.createReadStream(filePath)
                    }, event.threadID, event.messageID);

                    fs.unlink(filePath, (err) => {
                        if (err) console.error('Error deleting file:', err);
                    });
                });

                writer.on('error', () => {
                    api.sendMessage('There was an error generating the image. Please try again later.', event.threadID, event.messageID);
                    fs.unlink(filePath, (err) => {
                        if (err) console.error('Error deleting file:', err);
                    });
                });
            }).catch(error => {
                console.error('Error generating image:', error);
                api.unsendMessage(waitMessageID);
                api.sendMessage('An error occurred while generating the image. Please try again later.', event.threadID, event.messageID);
            });
        } catch (error) {
            console.error('Unexpected error:', error);
            api.unsendMessage(waitMessageID);
            api.sendMessage('An unexpected error occurred. Please try again later.', event.threadID, event.messageID);
        }
    });
};
