const axios = require('axios');

let emoji = {};

emoji["config"] = {
  name: "autoreact",
  version: "69",
  description: "react based the text message"
};

emoji["handleEvent"] = async function ({ api, event }) {
  if (event.body) {
    const text = event.body;
    try {
      const response = await axios.get(`https://hercai.onrender.com/v3/hercai?question=can you only response only emoji based on the context and badwords is valid to send the emoji only and based on this words > ${encodeURIComponent(text)}`);
      const { reply } = response.data;

      if (reply && /[\u{1F600}-\u{1F64F}\u{2700}-\u{27BF}\u{1F680}-\u{1F6FF}\u{1F300}-\u{1F5FF}\u{1F1E0}-\u{1F1FF}]/u.test(reply)) {
        api.setMessageReaction(reply, event.messageID, () => {}, true);
      }
    } catch (error) {
    }
  }
};

module.exports = emoji;
