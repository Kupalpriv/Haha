const axios = require('axios');
const { cliff } = require('../api');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: 'music',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: ['sing'],
    description: 'Search and download music from YouTube.',
    usage: 'music [search term]',
    credits: 'churchill',
    cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
    if (args.length === 0) {
        return api.sendMessage('𝑷𝒍𝒆𝒂𝒔𝒆 𝒑𝒓𝒐𝒗𝒊𝒅𝒆 𝒂 𝒎𝒖𝒔𝒊𝒄 𝒕𝒊𝒕𝒍𝒆', event.threadID, event.messageID);
    }

    const searchTerm = args.join(' ');
    const apiUrl = `${cliff}/yt-audio?search=${encodeURIComponent(searchTerm)}`;

    try {
        api.setMessageReaction('🎵', event.messageID, (err) => {
            if (err) console.error('Failed to set reaction:', err);
        });

        const response = await axios.get(apiUrl);
        const { title, downloadUrl, time, views, Artist, Album, channelName } = response.data;

        const musicPath = path.resolve(__dirname, 'music.mp3');
        const musicStream = await axios({
            url: downloadUrl,
            method: 'GET',
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(musicPath);
        musicStream.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await api.sendMessage(
            {
                body: `🎶 **${title}**\n\n🕒 Duration: ${time}\n👀 Views: ${views}\n🎤 Artist: ${Artist}\n💿 Album: ${Album}\n📺 Channel: ${channelName}`,
                attachment: fs.createReadStream(musicPath),
            },
            event.threadID,
            event.messageID
        );

        fs.unlinkSync(musicPath);
    } catch (error) {
        console.error('Error fetching music:', error);
        api.sendMessage('❌ Failed to retrieve or download the music. Please try again later.', event.threadID, event.messageID);
    } finally {
        api.setMessageReaction('', event.messageID, (err) => {
            if (err) console.error('Failed to remove reaction:', err);
        });
    }
};
