const path = require("path");
const axios = require("axios");
const fs = require("fs");

module.exports.config = {
  name: "video",
  version: "9",
  credits: "Cliff", //api by jonell & churo
  description: "Search video from YouTube",
  commandCategory: "media",
  hasPermssion: 0,
  cooldowns: 9,
  usages: "[video [search]",
  role: 0,
  hasPrefix: false,
};

module.exports.run = async function ({ api, args, event }) {
  try {
    const searchQuery = args.join(" ");
    if (!searchQuery) {
      api.sendMessage("Usage: video <search text>", event.threadID);
      return;
    }

    const ugh = api.sendMessage(`⏱️ | Searching, for '${searchQuery}' please wait...`, event.threadID);

    api.setMessageReaction("🕥", event.messageID, (err) => {}, true);

    const response = await axios.get(`https://betadash-search-download.vercel.app/video?search=${encodeURIComponent(searchQuery)}`);

    const data = response.data;
    const videoUrl = data.downloadUrl;
    const title = data.title;
    const thumbnail = data.thumbnail;

    const videoPath = path.join(__dirname, "cache", "video.mp4");

    const videoResponse = await axios.get(videoUrl, { responseType: "arraybuffer" });

    fs.writeFileSync(videoPath, Buffer.from(videoResponse.data));

    api.setMessageReaction("✅", event.messageID, (err) => {}, true);

    await api.sendMessage(
      {
        body: `Here's your video, enjoy!🥰\n\nTitle: ${title}\nImage: ${thumbnail}`,
        attachment: fs.createReadStream(videoPath),
      },
      event.threadID,
      event.messageID
    );
    fs.unlinkSync(videoPath);
    api.unsendMessage(ugh.messageID);
  } catch (error) {
    api.sendMessage(`error: ${error.message}`, event.threadID, event.messageID);
    console.log(error);
  }
};
