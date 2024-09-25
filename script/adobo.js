const axios = require('axios');

module.exports.config = {
  name: 'adobo',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['adobo'],
  description: "Adobo AI",
  usage: "adobo [query]",
  credits: 'churchill',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const query = args.join(" ");

  if (!query) {
    return api.sendMessage('Please provide a query. Example: adobo what is n1gga?', event.threadID, event.messageID);
  }

  // Send "answering..." message and save the message ID for unsending later
  const responseMessage = await new Promise((resolve, reject) => {
    api.sendMessage({
      body: '👄 𝐀𝐃𝐎𝐁𝐎 𝐀𝐈 // answering...',
      mentions: [{ tag: event.senderID, id: event.senderID }],
    }, event.threadID, (err, info) => {
      if (err) return reject(err);
      resolve(info);
    }, event.messageID); 
  });

  try {
    const startTime = Date.now();
    const apiUrl = `https://markdevs-last-api-2epw.onrender.com/api/adobo/gpt?query=${encodeURIComponent(query)}`;
    const response = await axios.get(apiUrl);
    const adoboResponse = response.data.result;
    const responseTime = ((Date.now() - startTime) / 1000).toFixed(2);

    api.getUserInfo(event.senderID, async (err, userInfo) => {
      if (err) {
        console.error('Error fetching user info:', err);
        return api.sendMessage('Error fetching user info.', event.threadID);
      }

      const userName = userInfo[event.senderID].name;
      const formattedResponse = `👄 𝐀𝐃𝐎𝐁𝐎 𝐀𝐈 // ${responseTime}s\n━━━━━━━━━━━━━━━━━━\n${adoboResponse}\n━━━━━━━━━━━━━━━━━━\n👤 𝙰𝚜𝚔𝚎𝚍 𝚋𝚢: ${userName}`;

      // Send the response and unsend the "answering..." message
      await api.sendMessage(formattedResponse.trim(), event.threadID);
      api.unsendMessage(responseMessage.messageID); // Unsend the "answering..." message
    });
  } catch (error) {
    console.error('Error:', error);
    api.sendMessage('Error: ' + error.message, event.threadID);
    api.unsendMessage(responseMessage.messageID); // Unsend the "answering..." message on error
  }
};
