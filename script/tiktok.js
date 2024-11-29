const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { jonel } = require('../api');

module.exports.config = {
    name: 'tiksearch',
    version: '1.0.0',
    role: 0,
    hasPrefix: false,
    aliases: ['tiktoksearch'],
    description: 'Search and fetch TikTok videos.',
    usage: 'tiksearch [keywords]',
    credits: 'jonel',
    cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
    const kupal = event.senderID;
    const pogi = args.join(' ');

    if (!pogi) {
        return api.sendMessage('❌ | Please provide keywords to search for TikTok videos.', event.threadID, event.messageID);
    }

    const loadingMessage = await api.sendMessage({
        body: `🔍 | Searching for TikTok videos...`,
    }, event.threadID, event.messageID);

    try {
        const tiktokUrl = `${jonel}/tiktok/searchvideo?keywords=${encodeURIComponent(pogi)}`;
        const { data } = await axios.get(tiktokUrl);

        if (!data.data || !data.data.videos.length) {
            await api.editMessage('❌ | No videos found. Please try different keywords.', loadingMessage.messageID);
            return;
        }

        const tiktokVideo = data.data.videos[0];
        const videoPath = path.join(__dirname, `${tiktokVideo.video_id}.mp4`);
        const videoStream = await axios.get(tiktokVideo.play, { responseType: 'stream' });
        const writer = fs.createWriteStream(videoPath);

        videoStream.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        const details = `
🎥 **TikTok Video**
🔗 Title: ${tiktokVideo.title}
👤 Author: ${tiktokVideo.author.nickname} (@${tiktokVideo.author.unique_id})
🎶 Music: ${tiktokVideo.music_info.title} by ${tiktokVideo.music_info.author}
👍 Likes: ${tiktokVideo.digg_count} | 💬 Comments: ${tiktokVideo.comment_count} | 🔄 Shares: ${tiktokVideo.share_count}
        `;

        await api.sendMessage({
            body: details,
            attachment: fs.createReadStream(videoPath),
        }, event.threadID, () => {
            fs.unlinkSync(videoPath);
        });

        await api.setMessageReaction('🔥', loadingMessage.messageID, true);
    } catch (err) {
        await api.editMessage('❌ | An error occurred while searching for TikTok videos.', loadingMessage.messageID);
    }
};
