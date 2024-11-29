const moment = require('moment-timezone');

module.exports.config = {
  name: "autogreet",
  version: "2.0.0",
  description: "Automatically sends greeting messages based on the current time.",
  credits: "chill",
};

let isGreetOn = true;

module.exports.handleEvent = async function ({ api, event }) {
  if (!isGreetOn) return;

  const arrayData = {
    "12:00:00 PM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 12:00 PM\n\n📌 Good afternoon everyone, don't forget to eat your lunch break 🍛"
    },
    "01:00:00 AM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 01:00 AM\n\n📌 Good morning everyone!! Have a nice morning 🥪☕🌄"
    },
    "02:00:00 AM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 02:00 AM\n\n📌 Don't forget to add/follow my owner 😊."
    },
    "03:00:00 AM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 03:00 AM\n\n📌 Aga nyo nagising ahh!"
    },
    "04:00:00 AM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 04:00 AM\n\n📌 Eyyy 🤙 don't panic, it's organic 🤙"
    },
    "05:00:00 AM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 05:00 AM\n\n📌 Aga nyo nagising ahh sanaol strong 💪🙏"
    },
    "06:00:00 AM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 06:00 AM\n\n📌 Kape muna kayo ☕"
    },
    "07:00:00 AM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 07:00 AM\n\n📌 Don't forget to eat y'all breakfast 🥪☕🍛"
    },
    "08:00:00 AM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 08:00 AM\n\n📌 Life update: Pogi parin owner ko 😎"
    },
    "09:00:00 AM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 09:00 AM\n\n📌 Baka hinde pa kayo kumain, kain na kayo 💪🙏"
    },
    "10:00:00 AM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 10:00 AM\n\n📌 Wag mo kalimutan e-chat owner ko 💪🙏"
    },
    "11:00:00 AM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 11:00 AM\n\n📌 Hinde mababawasan kapogian ng owner ko. Btw, have a nice morning everyone!"
    },
    "12:00:00 PM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 12:00 PM\n\n📌 Kain na kayo mga lods 💪"
    },
    "01:00:00 PM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 01:00 PM\n\n📌 Don't forget to eat y'all lunch break 😋"
    },
    "02:00:00 PM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 02:00 PM\n\n📌 Good afternoon!! My owner is so handsome asf 😎"
    },
    "03:00:00 PM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 03:00 PM\n\n📌 Miss ko na siya :("
    },
    "04:00:00 PM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 04:00 PM\n\n📌 Magandang hapon mga lods 😋"
    },
    "05:00:00 PM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 05:00 PM\n\n📌 Pogi ng owner ko na 😎"
    },
    "06:00:00 PM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 06:00 PM\n\n📌 Don't forget to eat y'all dinner 💪🙏"
    },
    "07:00:00 PM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 07:00 PM\n\n📌 Ano silbe ng pag online mo kung hinde mo din naman e-chat owner ko 😎"
    },
    "08:00:00 PM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 08:00 PM\n\n📌 Kumain naba kayo?"
    },
    "09:00:00 PM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 09:00 PM\n\n📌 Matulog na kayo mga hangal 😋"
    },
    "10:00:00 PM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 10:00 PM\n\n📌 Gabi na nag puyat parin kayo 💪🙏"
    },
    "11:00:00 PM": {
      message: "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 11:00 PM\n\n📌 Hinde mababawasan kapogian ng owner ko."
    }
  };

  const now = moment().tz('Asia/Manila').format('hh:mm:ss A');
  const messageData = arrayData[now];

  if (messageData) {
    try {
      api.sendMessage(messageData.message, event.threadID);
    } catch (error) {
      console.error('Error sending autogreet message:', error);
    }
  }
};

module.exports.run = async function ({ api, event, args }) {
  if (args.length === 0) {
    return api.sendMessage("Usage: greet on / off", event.threadID, event.messageID);
  }

  if (args[0].toLowerCase() === "on") {
    isGreetOn = true;
    api.sendMessage("Autogreet has been turned on.", event.threadID, event.messageID);
  } else if (args[0].toLowerCase() === "off") {
    isGreetOn = false;
    api.sendMessage("Autogreet has been turned off.", event.threadID, event.messageID);
  } else {
    api.sendMessage("Invalid Usage: autogreet on / off", event.threadID, event.messageID);
  }
};
