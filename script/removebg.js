const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
  name: "removebg",
  version: "1.0.0",
  role: 0,
  credits: "chill",
  aliases: [],
  usages: "< reply image >",
  cd: 2,
};

module.exports.run = async ({ api, event, args }) => {
  // Path to save the processed image
  let path = __dirname + `/cache/removed_bg.png`;
  const { threadID, messageID } = event;

  // Get the image URL either from the reply attachment or command arguments
  var imageUrl = event.messageReply?.attachments[0]?.url || args.join(" ");

  // If no image URL is provided, return an error message
  if (!imageUrl) {
    return api.sendMessage("Please reply to an image or provide an image URL.", threadID, messageID);
  }

  try {
    // Notify the user that the image is being processed
    api.sendMessage("Removing background...", threadID, messageID);

    // Send a GET request to the remove background API
    const response = await axios.get(`https://markdevs-last-api-2epw.onrender.com/api/removebg?imageUrl=${encodeURIComponent(imageUrl)}`);
    const processedImageURL = response.data.image_data;

    // Download the processed image
    const img = (await axios.get(processedImageURL, { responseType: "arraybuffer" })).data;

    // Save the image to a local file
    fs.writeFileSync(path, Buffer.from(img, 'utf-8'));

    // Send the processed image back to the chat
    api.sendMessage({
      body: "Background removed",
      attachment: fs.createReadStream(path)
    }, threadID, () => fs.unlinkSync(path), messageID);
  } catch (error) {
    api.sendMessage(`Error removing background: ${error.message}`, threadID, messageID);
  }
};
