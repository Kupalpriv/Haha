const axios = require('axios');

module.exports.config = {
  name: 'ai2',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['ai2'],
  description: "Ask AI a question",
  usage: "ai2 [question]",
  credits: 'churchill',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const prompt = args.join(" ");
  const threadID = event.threadID;
  const senderID = event.senderID;
  const messageID = event.messageID;

  if (!prompt) {
    api.sendMessage('Please provide a question, ex: ai2 what is love?', threadID, messageID);
    return;
  }

  const responseMessage = await new Promise(resolve => {
    api.sendMessage('🤖 𝚃𝚄𝚁𝙱𝙾 𝙰𝙽𝚂𝚆𝙴𝚁𝙸𝙽𝙶...', threadID, (err, info) => {
      if (err) {
        console.error('Error sending message:', err);
        return;
      }
      resolve(info);
    });
  });

  const apiUrl = `https://hiroshi-rest-api.replit.app/ai/turbov2?ask=${encodeURIComponent(prompt)}`;

  try {
    const startTime = Date.now();
    const response = await axios.get(apiUrl);
    const result = response.data;
    const aiResponse = result.response; // Adjusted to match new API response format
    const endTime = Date.now();
    const responseTime = ((endTime - startTime) / 1000).toFixed(2);

    api.getUserInfo(senderID, async (err, ret) => {
      if (err) {
        console.error('Error fetching user info:', err);
        await api.editMessage('Error fetching user info.', responseMessage.messageID);
        return;
      }

      const userName = ret[senderID].name;
      const formattedResponse = `🤖 𝙶𝙿𝚃+ 𝚃𝚄𝚁𝙱𝙾 𝙰𝙸
━━━━━━━━━━━━━━━━━━
${aiResponse}
━━━━━━━━━━━━━━━━━━
🗣 𝙰𝚜𝚔𝚎𝚍 𝚋𝚢: ${userName}
⏰ 𝚁𝚎𝚜𝚙𝚘𝚗𝚜𝚎 𝚃𝚒𝚖𝚎: ${responseTime}s`;

      try {
        await api.editMessage(formattedResponse, responseMessage.messageID);
      } catch (error) {
        console.error('Error editing message:', error);
        api.sendMessage('Error editing message: ' + error.message, threadID, messageID);
      }
    });
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = `⚠️ Error: ${error.message}. Please try again later.`;
    await api.editMessage(errorMessage, responseMessage.messageID);
  }
};
