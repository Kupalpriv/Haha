const moment = require("moment-timezone");

module.exports.config = {
  name: "autogreet",
  version: "2.0.0",
};

let lastGreetedTime = null;

module.exports.handleEvent = async function ({ api, event }) {
  const GREET_MESSAGES = {
    "12:00:00 PM": "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 12:00 PM\n\n📌 Good afternoon everyone, don't forget to eat your lunch! 🍛",
    "01:00:00 AM": "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 01:00 AM\n\n📌 Good morning everyone! Have a nice morning 🥪☕🌄",
    "02:00:00 AM": "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 02:00 AM\n\n📌 Don't forget to add/follow my owner 😊.",
    "03:00:00 AM": "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 03:00 AM\n\n📌 Aga nyo nagising ahh!",
    "04:00:00 AM": "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 04:00 AM\n\n📌 Eyyy 🤙 Don't panic, it's organic eyyyy 🤙",
    "05:00:00 AM": "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 05:00 AM\n\n📌 Aga nyo nagising ahh, sana all strong 💪🙏",
    "06:00:00 AM": "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 06:00 AM\n\n📌 Kape muna kayo ☕",
    "07:00:00 AM": "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 07:00 AM\n\n📌 Don't forget to eat your breakfast! 🥪☕🍛",
    "08:00:00 AM": "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 08:00 AM\n\n📌 Life update: pogi pa rin owner ko!",
    "09:00:00 AM": "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 09:00 AM\n\n📌 Baka hindi pa kayo kumakain, kain na kayo 💪🙏",
    "10:00:00 AM": "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 10:00 AM\n\n📌 Wag kalimutan i-chat owner ko 💪🙏",
    "11:00:00 AM": "𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧\n▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now - 11:00 AM\n\n📌 Hinde mababawasan kapogian ng owner ko. Have a nice morning everyone!",
  };

  const now = moment().tz("Asia/Manila");
  const currentTime = now.format("hh:mm:ss A");

  if (GREET_MESSAGES[currentTime] && currentTime !== lastGreetedTime) {
    try {
      api.sendMessage(GREET_MESSAGES[currentTime], event.threadID);
      lastGreetedTime = currentTime;
    } catch (error) {
      console.error("Error sending auto-greet message:", error.message);
    }
  }

  const nextMinute = moment().add(1, "minute").startOf("minute");
  const delay = nextMinute.diff(moment());
  setTimeout(() => module.exports.handleEvent({ api, event }), delay);
};
