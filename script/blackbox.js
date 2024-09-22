const axios = require('axios');

module.exports.config = {
  name: 'blackbox',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['blackbox'],
  description: "Blackbox AI Command",
  usage: "blackbox [query]",
  credits: 'pogi',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const chilli = args.join(" ");

  if (!chilli) {
    return api.sendMessage('Please provide a query. Example: blackbox what is AI?', event.threadID, event.messageID);
  }

  const bugok = await new Promise((resolve, reject) => {
    api.sendMessage({
      body: '🤖 𝐁𝐋𝐀𝐂𝐊𝐁𝐎𝐗 // answering...',
      mentions: [{ tag: event.senderID, id: event.senderID }],
    }, event.threadID, (err, info) => {
      if (err) return reject(err);
      resolve(info);
    }, event.messageID);
  });

  try {
    const startTime = Date.now();
    const apiUrl = `https://betadash-api-swordslush.vercel.app/blackbox?ask=${encodeURIComponent(chilli)}`;
    const response = await axios.get(apiUrl);
    const churchill = response.data.response;
    const responseTime = ((Date.now() - startTime) / 1000).toFixed(2);

    api.getUserInfo(event.senderID, async (err, userInfo) => {
      if (err) {
        console.error('Error fetching user info:', err);
        return await api.editMessage('Error fetching user info.', bugok.messageID);
      }

      const pogi = userInfo[event.senderID].name;

      const formattedResponse = `🤖 𝐁𝐋𝐀𝐂𝐊𝐁𝐎𝐗 // ${responseTime}s\n━━━━━━━━━━━━━━━━━━\n${churchill}\n━━━━━━━━━━━━━━━━━━\n👤 𝙰𝚜𝚔𝚎𝚍 𝚋𝚢: ${pogi}`;

      await api.editMessage(formattedResponse.trim(), bugok.messageID);
    });
  } catch (error) {
    console.error('Error:', error);
    await api.editMessage('Error: ' + error.message, bugok.messageID);
  }
};
