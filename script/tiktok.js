const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: 'tiktok',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: ['tt'],
    description: 'Search and download a TikTok video',
    usage: 'tiktok [search term]',
    credits: 'churchill',
    cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
    if (args.length === 0) {
        return api.sendMessage('🎥 Please provide a search term. For example:\n\ntiktok apt', event.threadID, event.messageID);
    }

    const searchTerm = args.join(' ');
    const searchApiUrl = `https://betadash-search-download.vercel.app/tiksearchv2?search=${encodeURIComponent(searchTerm)}&count=1`;

    let searchingMessageID;

    try {
        const searchingMessage = await api.sendMessage(`🔍 Searching TikTok videos for: *${searchTerm}*`, event.threadID);
        searchingMessageID = searchingMessage.messageID;

        const response = await axios.get(searchApiUrl);
        const { title, video } = response.data.data[0];

        const videoPath = path.resolve(__dirname, 'tiktok_video.mp4');
        const videoStream = await axios({
            url: video,
            method: 'GET',
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(videoPath);
        videoStream.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        const messageContent = `🎥 TikTok Video Found:
${title}`;

        await api.sendMessage(
            {
                body: messageContent,
                attachment: fs.createReadStream(videoPath),
            },
            event.threadID,
            event.messageID
        );

        if (searchingMessageID) {
            api.unsendMessage(searchingMessageID);
        }

        fs.unlinkSync(videoPath);

    } catch (error) {
        console.error('Error fetching or sending TikTok video:', error);
        api.sendMessage('❌ Failed to fetch or send the TikTok video. Please try again later.', event.threadID, event.messageID);
    }
};
