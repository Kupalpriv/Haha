const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: 'music',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: ['sing'],
    description: 'Search and download music using a keyword',
    usage: 'music [search term]',
    credits: 'churchill',
    cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
    if (args.length === 0) {
        return api.sendMessage('🎶 Please provide a search term. For example:\n\nmusic apt', event.threadID, event.messageID);
    }

    const searchTerm = args.join(' ');
    const searchApiUrl = `https://dlvc.vercel.app/yt-audio?search=${encodeURIComponent(searchTerm)}`;

    let searchingMessageID;

    try {
        const searchingMessage = await api.sendMessage(`🔍 Searching for music: *${searchTerm}*`, event.threadID);
        searchingMessageID = searchingMessage.messageID;

        const response = await axios.get(searchApiUrl);
        const { title, downloadUrl, time, views, Artist, Album, thumbnail, channelName } = response.data;

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

        const messageContent = `🎶 Now Playing: ${title}
📀 Album: ${Album}
🎤 Artist: ${Artist}
⏱️ Duration: ${time}
👀 Views: ${views}
📺 Channel: ${channelName}`;

        await api.sendMessage(
            {
                body: messageContent,
                attachment: [
                    fs.createReadStream(musicPath),
                    await axios({
                        url: thumbnail,
                        method: 'GET',
                        responseType: 'stream',
                    }).then((res) => res.data),
                ],
            },
            event.threadID,
            event.messageID
        );

        if (searchingMessageID) {
            api.unsendMessage(searchingMessageID);
        }

        fs.unlinkSync(musicPath);

    } catch (error) {
        console.error('Error fetching or sending music:', error);
        api.sendMessage('❌ Failed to fetch or send the music. Please try again later.', event.threadID, event.messageID);
    }
};
