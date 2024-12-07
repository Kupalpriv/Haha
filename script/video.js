const { kaizen } = require('../api');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports.config = {
    name: 'video',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: [],
    description: 'Search for a video using a keyword and send the video file.',
    usage: 'video [search term]',
    credits: 'churchill',
    cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
    if (args.length === 0) {
        return api.sendMessage('Please provide a search term.\n\nExample: video apt', event.threadID, event.messageID);
    }

    const chilli = args.join(' ');
    const pogi = `${kaizen}/api/ytsearch?q=${encodeURIComponent(chilli)}`;

    let bundat;

    try {
        const cute = await api.sendMessage(`🔍 Searching for: "${chilli}"...`, event.threadID);
        bundat = cute.messageID;

        const searchResult = await axios.get(pogi);
        const videoInfo = searchResult.data.items[0];

        if (!videoInfo) {
            return api.sendMessage('No results found. Please try a different keyword.', event.threadID, event.messageID);
        }

        const { title, url } = videoInfo;
        const converterURL = `${kaizen}/api/ytsearch?url=${encodeURIComponent(url)}`;
        const converted = await axios.get(converterURL);
        const videoURL = converted.data.items[0]?.url;

        if (!videoURL) {
            return api.sendMessage('Failed to convert the video. Please try again later.', event.threadID, event.messageID);
        }

        const filePath = path.resolve(__dirname, 'video.mp4');
        const videoStream = await axios({
            url: videoURL,
            method: 'GET',
            responseType: 'stream',
        });

        const fileWriter = fs.createWriteStream(filePath);
        videoStream.data.pipe(fileWriter);

        await new Promise((resolve, reject) => {
            fileWriter.on('finish', resolve);
            fileWriter.on('error', reject);
        });

        await api.sendMessage(
            {
                body: `🎬 Here's your video: ${title}`,
                attachment: fs.createReadStream(filePath),
            },
            event.threadID,
            event.messageID
        );

        fs.unlinkSync(filePath);
    } catch (error) {
        api.sendMessage('An error occurred while processing your request. Please try again later.', event.threadID, event.messageID);
    } finally {
        if (bundat) {
            api.unsendMessage(bundat);
        }
    }
};
