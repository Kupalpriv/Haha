const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "ss",
  version: "1.0.0",
  hasPermission: 0,
  credits: "churchill",
  description: "Takes a screenshot of a provided link and sends it as an attachment",
  commandCategory: "Utilities",
  usages: "[URL]",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args }) {
  const link = args[0];

  if (!link || !link.startsWith("http")) {
    return api.sendMessage("Please provide a valid URL!", event.threadID);
  }

  const apiUrl = `https://api-nako-choru-production.up.railway.app/ss?device=laptop&link=${encodeURIComponent(link)}`;

  try {
    const response = await axios.get(apiUrl);
    const screenshotUrl = response.data.image;

    const imagePath = path.resolve(__dirname, 'screenshot.jpg');
    const imageResponse = await axios({
      url: screenshotUrl,
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(imagePath);
    imageResponse.data.pipe(writer);

    writer.on('finish', () => {
      api.sendMessage(
        {
          body: `Here's the screenshot of the link: ${link}`,
          attachment: fs.createReadStream(imagePath),
        },
        event.threadID,
        () => {
          fs.unlinkSync(imagePath);
        }
      );
    });

    writer.on('error', (err) => {
      console.error("Error writing image:", err);
      api.sendMessage("Failed to process the screenshot.", event.threadID);
    });

  } catch (error) {
    console.error("Error fetching screenshot:", error);
    api.sendMessage("Unable to take screenshot of the provided link.", event.thr
