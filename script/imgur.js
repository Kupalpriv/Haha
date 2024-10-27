const axios = require('axios');

module.exports.config = {
  name: "imgur",
  version: "30.0.10",
  role: 0,
  credits: "cliff",
  description: "imgur upload",
  hasPrefix: false,
  usages: "[reply to image]",
  cooldown: 5,
  aliases: ["im"]
};

module.exports.run = async ({ api, event }) => {
  const uid = event.senderID;
  let link2;

  if (event.type === "message_reply" && event.messageReply.attachments.length > 0) {
    link2 = event.messageReply.attachments[0].url;
  } else if (event.attachments.length > 0) {
    link2 = event.attachments[0].url;
  } else {
    return api.sendMessage('No attachment detected. Please reply to an image.', event.threadID, event.messageID);
  }

  try {
    const res = await axios.get(`https://betadash-uploader.vercel.app/imgur?link=${encodeURIComponent(link2)}`);
    const link = res.data.uploaded.image;
    return api.sendMessage(`Here is the Imgur link for the image you provided:\n\n${link}`, event.threadID, event.messageID);
  } catch (error) {
    return api.sendMessage("error uploading image to imgur", event.threadID, event.messageID);
  }
};
