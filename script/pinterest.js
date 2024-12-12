const { hiro } = require('../api');

module.exports.config = {
  name: "pinterest",
  version: "1.0.1",
  role: 0,
  credits: "Churchill",
  description: "Image search",
  hasPrefix: false,
  commandCategory: "Search",
  usages: "[Text]",
  aliases: ["pin"],
  cooldowns: 0,
};

module.exports.run = async function({ api, event, args }) {
  const axios = require("axios");
  const fs = require("fs-extra");

  const keySearch = args.join(" ");
  if (!keySearch.includes("-")) {
    return api.sendMessage(
      "ENTER A PROMPT\n\nEXAMPLE: pinterest ivana alawi - 5",
      event.threadID,
      event.messageID
    );
  }

  const searchQuery = keySearch.substr(0, keySearch.indexOf('-')).trim();
  const numberOfResults = parseInt(keySearch.split("-").pop()) || 5;

  try {
    const response = await axios.get(`${hiro}/image/pinterest?search=${encodeURIComponent(searchQuery)}`);
    const images = response.data.data;

    if (!images || images.length === 0) {
      return api.sendMessage(
        "NO IMAGES FOUND. TRY A DIFFERENT KEYWORD.",
        event.threadID,
        event.messageID
      );
    }

    const selectedImages = images.slice(0, numberOfResults);
    const attachments = [];

    for (let i = 0; i < selectedImages.length; i++) {
      const imagePath = `${__dirname}/cache/img_${i + 1}.jpg`;
      const imageBuffer = (await axios.get(selectedImages[i], { responseType: "arraybuffer" })).data;

      fs.writeFileSync(imagePath, imageBuffer);
      attachments.push(fs.createReadStream(imagePath));
    }

    await api.sendMessage(
      {
        attachment: attachments,
        body: `🔥 RESULTS FOR: ${searchQuery.toUpperCase()}\n📸 IMAGES FOUND: ${selectedImages.length}/${response.data.count}`,
      },
      event.threadID,
      event.messageID
    );

    for (let i = 0; i < selectedImages.length; i++) {
      const imagePath = `${__dirname}/cache/img_${i + 1}.jpg`;
      fs.unlinkSync(imagePath);
    }
  } catch (error) {
    return api.sendMessage(
      "ERROR FETCHING IMAGES. PLEASE TRY AGAIN LATER.",
      event.threadID,
      event.messageID
    );
  }
};
