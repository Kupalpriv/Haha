const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { cliff } = require('../api');

module.exports.config = {
    name: 'tiktok',
    version: '1.0.0',
    role: 0,
    hasPrefix: false,
    aliases: ['tiksearch'],
    description: 'Search and fetch TikTok videos.',
    usage: 'tiktok [keywords]',
    credits: 'chilli',
    cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
    const kupal = event.senderID;
    const pogi = args.join(' ');

    if (!pogi) {
        return api.sendMessage('❌ | Please provide keywords to search for TikTok videos.', event.threadID, event.messageID);
    }

    let loadingMessageID;
    try {
        const loadingMessage = await api.sendMessage({
            body: `🔍 | Searching for TikTok videos...`,
        }, event.threadID, event.messageID);

        loadingMessageID = loadingMessage.messageID;

    
        const tiktokUrl = `${cliff}/tiktok/searchvideo?keywords=${encodeURIComponent(pogi)}&count=1`;
        const { data } = await axios.get(tiktokUrl);

        if (!data.data || !data.data.length) {
            await api.sendMessage('❌ | No videos found. Please try different keywords.', event.threadID, event.messageID);
            return;
        }

        const tiktokVideo = data.data[0];
        const videoPath = path.join(__dirname, `${tiktokVideo.title}.mp4`);
        const videoStream = await axios.get(tiktokVideo.video, { responseType: 'stream' });
        const writer = fs.createWriteStream(videoPath);

        videoStream.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        const details = `
🎥 **TikTok Video**
🔗 Title: ${tiktokVideo.title}
📺 Video URL: ${tiktokVideo.video}
        `;

        await api.sendMessage({
            body: details,
            attachment: fs.createReadStream(videoPath),
        }, event.threadID, () => {
            fs.unlinkSync(videoPath);
        });

        if (loadingMessageID) {
            await api.unsendMessage(loadingMessageID);  // Unsend the loading message instead of deleting
        }
    } catch (err) {
        console.error('Error in TikTok Search:', err);
        await api.sendMessage('❌ | An error occurred while searching for TikTok videos.', event.threadID, event.messageID);
    }
};
