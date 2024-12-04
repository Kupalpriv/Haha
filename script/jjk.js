const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { kaizen } = require('../api');

module.exports.config = {
    name: 'jjk',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: ['jujutsu', 'sukuna'],
    description: 'Get a random Jujutsu Kaisen video.',
    usage: 'jjk',
    credits: 'churchill',
    cooldown: 5,
};

module.exports.run = async function({ api, event }) {
    const loadingMessage = await api.sendMessage('🎥 Sending random JJK video...', event.threadID, event.messageID);

    try {
        const response = await axios.get(`${kaizen}/api/random-jjk`);
        const { video_url } = response.data;

        const filePath = path.resolve(__dirname, 'random_jjk_video.mp4');
        const videoStream = await axios({
            url: video_url,
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
                attachment: fs.createReadStream(filePath),
            },
            event.threadID,
            event.messageID
        );

        fs.unlinkSync(filePath);
    } catch (error) {
        console.error('Error fetching or sending JJK video:', error);
        api.sendMessage('Failed to fetch or send the JJK video. Please try again later.', event.threadID, event.messageID);
    } finally {
        if (loadingMessage) {
            api.unsendMessage(loadingMessage.messageID);
        }
    }
};
