const axios = require('axios');
const fs = require('fs');

module.exports.config = {
  name: "x",
  version: "1.0",
  author: "chill",
  countDown: 6,
  role: 0,
  description: "Search and download videos",
  hasPrefix: false,
  aliases: ["xs"],
  usage: "[x <video name>]",
  cooldown: 5
};

module.exports.run = async function({ api, event, args }) {
  const searchQuery = encodeURIComponent(args.join(" "));
  const apiUrl = `https://ggwp-yyxy.onrender.com/api/xsearch?q=${searchQuery}`;
  
  if (!searchQuery) {
    return api.sendMessage("Please provide the video title.", event.threadID, event.messageID);
  }

  try {
    const response = await axios.get(apiUrl);
    const tracks = response.data.result.result;

    if (tracks.length > 0) {
      const selectedTrack = tracks[0];
      const videoUrl = selectedTrack.link;
      const downloadApiUrl = `https://ggwp-yyxy.onrender.com/api/xdl?q=${encodeURIComponent(videoUrl)}`;

      api.sendMessage("⏳ | Downloading your video, please wait...", event.threadID, async (err, info) => {
        if (err) {
          console.error(err);
          api.sendMessage("🚧 | An error occurred while sending message.", event.threadID);
          return;
        }

        try {
          const downloadLinkResponse = await axios.get(downloadApiUrl);
          const downloadLink = downloadLinkResponse.data.downloadLink;

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
              body: `🎥 Video Download\n\nHere's your video: ${selectedTrack.title}.\n\nInfo: ${selectedTrack.info}\nEnjoy watching!...🥰`,
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
