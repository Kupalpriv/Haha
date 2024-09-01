const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: 'pinterest',
    version: '1.0.0',
    role: 0,
    hasPrefix: false,
    aliases: ['pin'],
    description: 'Fetch and send Pinterest images based on a query',
    usage: 'pinterest [search term] - [number of images]',
    credits: 'churchill',
    cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
    const input = args.join(' ').split(' - ');
    const query = input[0];
    const imageCount = parseInt(input[1]);

    if (!query) {
        return api.sendMessage('Please provide a search term, for example: pinterest Batman - 3', event.threadID, event.messageID);
    }

    if (isNaN(imageCount) || imageCount <= 0) {
        return api.sendMessage('Please provide a valid number of images to send, for example: pinterest Batman - 3', event.threadID, event.messageID);
    }

    const apiUrl = `https://deku-rest-api.gleeze.com/api/pinterest?q=${encodeURIComponent(query)}`;

    try {
        const response = await axios.get(apiUrl);
        const pinterestResults = response.data.result;

        if (pinterestResults && pinterestResults.length > 0) {
            const imagesToSend = pinterestResults.slice(0, imageCount);
            const attachments = [];

            for (const [index, url] of imagesToSend.entries()) {
                const imagePath = path.resolve(__dirname, `./tempimage_${index}.jpg`);
                const writer = fs.createWriteStream(imagePath);

                const imageResponse = await axios.get(url, { responseType: 'stream' });
                imageResponse.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                attachments.push(fs.createReadStream(imagePath));
                fs.unlinkSync(imagePath);
            }

            await api.sendMessage({ body: '', attachment: attachments }, event.threadID);

        } else {
            await api.sendMessage('No images found for the given query.', event.threadID, event.messageID);
        }

    } catch (error) {
        console.error('Error:', error);
        await api.sendMessage('An error occurred while fetching images from Pinterest. Please try again later.', event.threadID, event.messageID);
    }
};
