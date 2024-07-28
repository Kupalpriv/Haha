const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: 'pinterest',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['pinterest'],
  description: "Fetch images from a Pinterest-like API",
  usage: "pinterest [keyword] - [count]",
  credits: 'chill',
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  // Parse the command arguments
  const input = args.join(" ").split(" - ");
  const keyword = input[0];
  const count = Math.min(parseInt(input[1], 10) || 1, 10); // Default to 1 if not specified, max 10
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!keyword) {
    api.sendMessage('Please provide a keyword, e.g., pinterest cat - 3', threadID, messageID);
    return;
  }

  const apiUrl = `https://hiroshi-rest-api.replit.app/search/pinterest?search=${encodeURIComponent(keyword)}`;

  try {
    const response = await axios.get(apiUrl);
    const images = response.data.data;

    if (!images || images.length === 0) {
      api.sendMessage('No images found for your keyword.', threadID, messageID);
      return;
    }

    const imageLinks = images.slice(0, count); // Get the specified number of images

    // Download each image and send as an attachment
    for (let i = 0; i < imageLinks.length; i++) {
      const imageUrl = imageLinks[i];
      const imagePath = path.join(__dirname, `image_${i}.jpg`);
      
      const writer = fs.createWriteStream(imagePath);

      const response = await axios({
        url: imageUrl,
        method: 'GET',
        responseType: 'stream',
      });

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Send the image as an attachment
      await api.sendMessage(
        {
          attachment: fs.createReadStream(imagePath),
        },
        threadID,
        messageID
      );

      // Remove the downloaded image to save space
      fs.unlinkSync(imagePath);
    }
  } catch (error) {
    console.error('Error fetching images:', error);
    api.sendMessage(`Error: ${error.message}`, threadID, messageID);
  }
};
