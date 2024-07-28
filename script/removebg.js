const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
  name: 'removebg',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['removebg'],
  description: "Remove background from an image attachment",
  usage: "removebg [attachment]",
  credits: 'chilli',
  cooldown: 3,
};

module.exports.run = async function({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  // Check if there is an attachment and it's an image
  if (!event.attachments || event.attachments.length === 0) {
    api.sendMessage('Please reply to image na removebg.', threadID, messageID);
    return;
  }

  const imageAttachment = event.attachments[0];
  if (imageAttachment.type !== 'photo') {
    api.sendMessage('Please provide a valid image attachment.', threadID, messageID);
    return;
  }

  const imageUrl = imageAttachment.url;
  const apiUrl = `https://markdevs-last-api-2epw.onrender.com/api/removebg?imageUrl=${encodeURIComponent(imageUrl)}`;

  try {
    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    // Path where the modified image will be temporarily stored
    const outputFilePath = path.join(__dirname, 'output.png');

    // Save the image without the background to the disk
    await fs.writeFile(outputFilePath, buffer);

    // Send the image without the background as an attachment
    await api.sendMessage(
      {
        attachment: fs.createReadStream(outputFilePath),
      },
      threadID,
      () => {
        // Clean up the temporary file after sending
        fs.remove(outputFilePath);
      }
    );
  } catch (error) {
    console.error('Error removing background:', error);
    api.sendMessage(`Error: ${error.message}`, threadID, messageID);
  }
};
