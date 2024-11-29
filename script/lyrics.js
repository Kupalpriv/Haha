const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { markApi } = require('../api');

module.exports.config = {
    name: 'lyrics',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: ['lyric', 'songlyrics'],
    description: 'Fetch song lyrics using the provided API.',
    usage: 'lyrics [song title]',
    credits: 'churchill',
    cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
    if (args.length === 0) {
        return api.sendMessage('Please provide a song title to search for lyrics.\n\nEx: lyrics Muli', event.threadID, event.messageID);
    }

    const songTitle = args.join(' ');
    const apiUrl = `${markApi}/api/lyrics/song?title=${encodeURIComponent(songTitle)}`;

    try {
        const response = await axios.get(apiUrl);
        const { title, artist, lyrics, song_thumbnail } = response.data.content;

        const thumbnailPath = path.resolve(__dirname, 'thumbnail.jpg');
        const thumbnailResponse = await axios({
            url: song_thumbnail,
            method: 'GET',
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(thumbnailPath);
        thumbnailResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await api.sendMessage(
            {
                attachment: fs.createReadStream(thumbnailPath),
            },
            event.threadID
        );

        fs.unlinkSync(thumbnailPath);

        const formattedLyrics = `
🎶 **${title}** by **${artist}** 🎤
━━━━━━━━━━━━━━━━━━
${lyrics.trim()}
━━━━━━━━━━━━━━━━━━
Enjoy! ❤️`;

        await api.sendMessage(formattedLyrics, event.threadID, event.messageID);

    } catch (error) {
        console.error('Error fetching lyrics:', error);
        api.sendMessage('❌ Unable to fetch lyrics. Please try again later.', event.threadID, event.messageID);
    }
};
