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
  const input = args.join(" ").split(" - ");
  const keyword = input[0];
  const count = Math.min(parseInt(input[1], 10) || 1, 10);
  const threadID = event.threadID;
  const messageID = event.messageID;

  if (!keyword) {
    api.sendMessage('Please provide a keyword, e.g., pinterest cat - 3', threadID, messageID);
    return;
  }

  const apiUrl = `https://hiroshi-rest-api.replit.app/search/pinterest?search=${encodeURIComponent(keyword)}`;

  try {
    const apiResponse = await axios.get(apiUrl);
    const images = apiResponse.data.data;

    if (!images || images.length === 0) {
      api.sendMessage('No images found for your keyword.', threadID, messageID);
      return;
    }

    const imageLinks = images.slice(0, count);

    for (let i = 0; i < imageLinks.length; i++) {
      const imageUrl = imageLinks[i];
      const imagePath = path.join(__dirname, `image_${i}.jpg`);
      
      const writer = fs.createWriteStream(imagePath);

      const imageResponse = await axios({
        url: imageUrl,
        method: 'GET',
        responseType: 'stream',
      });

      imageResponse.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      await api.sendMessage(
        {
          attachment: fs.createReadStream(imagePath),
        },
        threadID,
        messageID
      );

      fs.unlinkSync(imagePath);
    }
  } catch (error) {
    console.error('Error fetching images:', error);
    api.sendMessage(`Error: ${error.message}`, threadID, messageID);
  }
};
