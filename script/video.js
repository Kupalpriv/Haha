const fs = require('fs');
const axios = require('axios');

module.exports.config = {
  name: "video",
  version: "4.6",
  role: 0, // Adjust role as needed
  description: "Search and download videos",
  hasPrefix: false,
  aliases: ["s"],
  usage: "[s <video name>]",
  cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
  const searchQuery = encodeURIComponent(args.join(" "));
  const apiUrl = `https://c-v1.onrender.com/yt/s?query=${searchQuery}`;
  
  if (!searchQuery) {
    return api.sendMessage("Please provide the video title.", event.threadID, event.messageID);
  }

  try {
    const response = await axios.get(apiUrl);
    const tracks = response.data;

    if (tracks.length > 0) {
      const selectedTrack = tracks[0];
      const videoUrl = selectedTrack.videoUrl;
      const downloadApiUrl = `https://c-v1.onrender.com/downloader?url=${encodeURIComponent(videoUrl)}`;

      api.sendMessage("⏳ | Downloading your video, please wait...", event.threadID, async (err, info) => {
        if (err) {
          console.error(err);
          api.sendMessage("🚧 | An error occurred while sending message.", event.threadID);
          return;
        }

        try {
          const downloadLinkResponse = await axios.get(downloadApiUrl);
          const downloadLink = downloadLinkResponse.data.media.url;

          const filePath = `${__dirname}/cache/${Date.now()}.mp4`;
          const writer = fs.createWriteStream(filePath);

          const response = await axios({
            url: downloadLink,
            method: 'GET',
            responseType: 'stream'
          });

          response.data.pipe(writer);

          writer.on('finish', () => {
            api.setMessageReaction("✅", info.messageID);
            
            api.sendMessage({
              body: `🎶 𝗬𝗼𝘂𝗧𝘂𝗯𝗲\n\n━━━━━━━━━━━━━\nHere's your video ${selectedTrack.title}.\n\n📒 𝗧𝗶𝘁𝗹𝗲: ${selectedTrack.title}\n📅 𝗣𝘂𝗯𝗹𝗶𝘀𝗵 𝗗𝗮𝘁𝗲: ${selectedTrack.publishDate}\n👀 𝗩𝗶𝗲𝘄𝘀: ${selectedTrack.viewCount}\n👍 𝗟𝗶𝗸𝗲𝘀: ${selectedTrack.likeCount}\n\nEnjoy watching!...🥰`,
              attachment: fs.createReadStream(filePath),
            }, event.threadID, () => fs.unlinkSync(filePath));
          });

          writer.on('error', (err) => {
            console.error(err);
            api.sendMessage("🚧 | An error occurred while processing your request.", event.threadID);
          });
        } catch (error) {
          console.error(error);
          api.sendMessage(`🚧 | An error occurred while processing your request: ${error.message}`, event.threadID);
        }
      });

    } else {
      api.sendMessage("❓ | Sorry, couldn't find the requested video.", event.threadID);
    }
  } catch (error) {
    console.error(error);
    api.sendMessage("🚧 | An error occurred while processing your request.", event.threadID, event.messageID);
  }
};
