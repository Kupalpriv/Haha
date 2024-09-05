const chilli = require("axios");
const bundat = require("path");
const buang = require("fs");

module.exports.config = {
  name: "music",
  version: "1.0",
  credits: "churchill",
  description: "Search and download songs from Spotify",
  commandCategory: "media",
  aliases: ["song", "sing", "spotify"],
  hasPermssion: 0,
  cooldowns: 5,
  usages: "[spotify <search text>]",
  role: 0,
  hasPrefix: false,
};

module.exports.run = async function ({ api, args, event }) {
  try {
    const searchQuery = args.join(" ");
    if (!searchQuery) {
      api.sendMessage("Usage: spotify <search text>", event.threadID);
      return;
    }

    const calamansi = api.sendMessage(`🎵 Searching for '${searchQuery}', please wait...`, event.threadID);

    const response = await chilli.get(`https://hiroshi-api.onrender.com/tiktok/spotify?search=${encodeURIComponent(searchQuery)}`);

    const data = response.data[0];
    const songUrl = data.download;
    const songTitle = data.name;
    const songImage = data.image;

    const songPath = bundat.join(__dirname, "cache", "song.mp3");
    const imagePath = bundat.join(__dirname, "cache", "song.jpg");

    const songResponse = await chilli.get(songUrl, { responseType: "arraybuffer" });
    buang.writeFileSync(songPath, Buffer.from(songResponse.data));

    const imageResponse = await chilli.get(songImage, { responseType: "arraybuffer" });
    buang.writeFileSync(imagePath, Buffer.from(imageResponse.data));

    api.sendMessage(
      {
        body: `🎶 Here is your song:\n\nTitle: ${songTitle}\nEnjoy!`,
        attachment: [buang.createReadStream(songPath), buang.createReadStream(imagePath)],
      },
      event.threadID,
      event.messageID
    );

    buang.unlinkSync(songPath);
    buang.unlinkSync(imagePath);

    api.unsendMessage(calamansi.messageID);
  } catch (error) {
    api.sendMessage(`Error: ${error.message}`, event.threadID, event.messageID);
    console.error(error);
  }
};
