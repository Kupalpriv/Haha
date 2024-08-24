const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: 'spotify',
    version: '1.0.0',
    role: 0,
    hasPrefix: false,
    aliases: ['music', 'sp'],
    description: 'Search and send Spotify music preview as voice attachment',
    usage: 'spotify [song name]',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const query = args.join(' ');

    if (!query) {
        return api.sendMessage('Please provide a song name to search for.', event.threadID, event.messageID);
    }

    const searchUrl = `https://deku-rest-api.gleeze.com/search/spotify?q=${encodeURIComponent(query)}`;

    try {
        const response = await axios.get(searchUrl);
        const results = response.data.result;

        if (results.length === 0) {
            return api.sendMessage('No results found for your query.', event.threadID, event.messageID);
        }

        const track = results[0]; // Get the first result
        const trackTitle = track.title;
        const trackArtist = track.artist;
        const previewUrl = track.direct_url;

        // Download the audio preview
        const audioPath = path.resolve(__dirname, `${trackTitle}-${trackArtist}.mp3`);
        const writer = fs.createWriteStream(audioPath);

        const previewResponse = await axios({
            url: previewUrl,
            method: 'GET',
            responseType: 'stream'
        });

        previewResponse.data.pipe(writer);

        writer.on('finish', async () => {
            // Send the voice attachment
            const attachment = fs.createReadStream(audioPath);
            api.sendMessage({
                body: `🎶 Now Playing: ${trackTitle} by ${trackArtist}`,
                attachment
            }, event.threadID, () => {
                // Delete the file after sending
                fs.unlinkSync(audioPath);
            });
        });

        writer.on('error', err => {
            console.error('Error writing audio file:', err);
            api.sendMessage('Failed to download the audio preview.', event.threadID, event.messageID);
        });

    } catch (error) {
        console.error('Error:', error);
        return api.sendMessage('An error occurred while processing your request.', event.threadID, event.messageID);
    }
};
