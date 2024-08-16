const axios = require('axios');

let activeIntervals = {};

module.exports.config = {
  name: 'bible',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['bible', 'verse'],
  description: "Random Bible verse and periodic Bible verses every 10 minutes",
  usage: "bible on | bible off | bible",
  credits: 'chilling',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const threadID = event.threadID;

  if (args[0] === 'on') {
    if (activeIntervals[threadID]) {
      return api.sendMessage('Bible verse sending is already enabled in this thread.', threadID, event.messageID);
    }

    activeIntervals[threadID] = setInterval(async () => {
      try {
        const response = await axios.get('https://ggwp-ifzt.onrender.com/bible');
        const verse = response.data.verse;
        const reference = response.data.reference;

        const message = {
          body: `📖 Here is a random Bible verse for you:\n\n*${verse}*\n\n— _${reference}_`,
        };

        api.sendMessage(message, threadID);
      } catch (error) {
        api.sendMessage('An error occurred while fetching the Bible verse.', threadID);
      }
    }, 10 * 60 * 1000);

    return api.sendMessage('Bible verse sending has been enabled. You will receive a verse every 10 minutes.', threadID, event.messageID);

  } else if (args[0] === 'off') {
    if (!activeIntervals[threadID]) {
      return api.sendMessage('Bible verse sending is already disabled in this thread.', threadID, event.messageID);
    }

    clearInterval(activeIntervals[threadID]);
    delete activeIntervals[threadID];

    return api.sendMessage('Bible verse sending has been disabled.', threadID, event.messageID);
  } else {
    try {
      const response = await axios.get('https://ggwp-ifzt.onrender.com/bible');
      const verse = response.data.verse;
      const reference = response.data.reference;

      const message = {
        body: `📖 Here is a random Bible verse for you:\n\n*${verse}*\n\n— _${reference}_`,
      };

      return api.sendMessage(message, threadID, event.messageID);
    } catch (error) {
      return api.sendMessage('An error occurred while fetching the Bible verse.', threadID, event.messageID);
    }
  }
};
