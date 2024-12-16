const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: 'video',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: [],
    description: 'Search and download a video using the provided API',
    usage: 'video [search term]',
    credits: 'churchill',
    cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
    const searchQuery = args.join(' ');

    if (!searchQuery) {
        return api.sendMessage('Please provide a search term.', event.threadID, event.messageID);
    }

    const apiUrl = `https://yt-video-production.up.railway.app/videov2?search=${encodeURIComponent(searchQuery)}`;
    const startTime = Date.now();

    const loadingMessage = await new Promise((resolve, reject) => {
        api.sendMessage(
            'Searching for the video...',
            event.threadID,
            (err, info) => {
                if (err) return reject(err);
                resolve(info);
            },
            event.messageID
        );
    });

    // Automatically unsend the "searching" message after 35 seconds
    setTimeout(() => {
        api.unsendMessage(loadingMessage.messageID, (err) => {
            if (err) console.error('Failed to unsend search indicator:', err);
        });
    }, 35000);

    try {
        const response = await axios.get(apiUrl);
        const { title, downloadUrl, time, views, image, channelName } = response.data;

        const videoPath = path.join(__dirname, 'downloaded_video.mp4');
        const videoResponse = await axios.get(downloadUrl, { responseType: 'stream' });

        const writer = fs.createWriteStream(videoPath);
        videoResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        const responseTime = ((Date.now() - startTime) / 1000).toFixed(3);

        await api.sendMessage(
            {
                body: `Title: ${title}\nDuration: ${time}\nViews: ${views}\nChannel: ${channelName}\nResponse Time: ${responseTime}s`,
                attachment: fs.createReadStream(videoPath),
            },
            event.threadID,
            () => fs.unlinkSync(videoPath),
            event.messageID
        );
    } catch (error) {
        console.error('Error fetching or downloading video:', error.message);
        await api.editMessage(
            'An error occurred while fetching or downloading the video. Please try again later.',
            loadingMessage.messageID
        );
    }
};
