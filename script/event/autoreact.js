const axios = require('axios');

module.exports.config = {
  name: "autoreact",
  version: "1.0",
  credits: "chill",
};

module.exports.handleEvent = async function ({ api, event }) {
  if (event.body) {
  
    const messageText = event.body;

  
    try {
      const response = await axios.get(`https://ccexplorerapisjonell.vercel.app/api/message/emoji?text=${encodeURIComponent(messageText)}`);
      const emoji = response.data.emoji; // Assuming the response contains an 'emoji' field

      // Set the emoji as a reaction to the message
      api.setMessageReaction(emoji, event.messageID, () => {}, true);
    } catch (error) {
      console.error('Error fetching emoji:', error);
    }
  }
};
