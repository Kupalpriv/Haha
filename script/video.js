const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { kenlie, neth } = require('../api'); 

module.exports.config = {
    name: 'video',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: [],
    description: 'Search for a video using a keyword and send the video file.',
    usage: 'video [search term]',
    credits: 'chilli',
    cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
    if (args.length === 0) {
        return api.sendMessage('Please provide a search term. Usage: video [search term]', event.threadID, event.messageID);
    }

    const searchTerm = args.join(' ');
    const searchApiUrl = `${neth}/api/ytsearch2?name=${encodeURIComponent(searchTerm)}`;

    let searchingMessageID;

    try {
        const searchingMessage = await api.sendMessage(`🔍 Searching for video: ${searchTerm}`, event.threadID);
        searchingMessageID = searchingMessage.messageID;

        setTimeout(() => {
            if (searchingMessageID) {
                api.unsendMessage(searchingMessageID);
            }
        }, 20000);

        const searchResponse = await axios.get(searchApiUrl);
        const videoData = searchResponse.data.result[0];
        const { title, url } = videoData;

        const convertApiUrl = `${kenlie}/video?url=${encodeURIComponent(url)}`;
        const convertResponse = await axios.get(convertApiUrl);
        const downloadUrl = convertResponse.data.response;

        const filePath = path.resolve(__dirname, 'downloaded_video.mp4');
        const videoStream = await axios({
            url: downloadUrl,
            method: 'GET',
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(filePath);
        videoStream.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await api.sendMessage(
            {
                body: `🎬 Here is the video: ${title}`,
                attachment: fs.createReadStream(filePath),
            },
            event.threadID,
            event.messageID
        );

        fs.unlinkSync(filePath);
    } catch (error) {
        console.error('Error fetching or sending video:', error);
        api.sendMessage('Failed to fetch or send the video. Please try again later.', event.threadID, event.messageID);
    }
};
