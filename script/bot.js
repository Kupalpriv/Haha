const first = `██████╗ 
██╔══██╗
██████╔╝
██╔══██╗
██████╔╝
╚═════╝ \n𝙷𝚒! 𝙸'𝚖 chillibot`;

const second = (prefix) => `██████╗ 
██╔═══██╗
██║        ██║
██║        ██║
╚██████╔╝
 ╚═════╝ \n𝙱𝚘𝚝 𝚖𝚢 𝚙𝚛𝚎𝚏𝚒𝚡 𝚒𝚜: ${prefix}`;

const third = (admin) => `████████╗
╚══██╔══╝
        ██║   
        ██║   
        ██║   
        ╚═╝\n𝙸 𝚠𝚊𝚜 𝚌𝚛𝚎𝚊𝚝𝚎𝚍 𝚋𝚢: https://www.facebook.com/${admin}`;

const fourth = (prefix) => `██████╗ 
██╔══██╗
██████╔╝
██╔══██╗
██████╔╝
╚═════╝ 

 ██████╗ 
██╔═══██╗
██║         ██║
██║         ██║
╚██████╔╝
 ╚═════╝ 

████████╗
╚══██╔══╝
         ██║   
         ██║   
         ██║   
        ╚═╝\n𝚃𝚢𝚙𝚎 "${prefix}help" 𝚝𝚘 𝚟𝚒𝚎𝚠 𝚊𝚕𝚕 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜.\n𝚈𝚘𝚞 𝚌𝚊𝚗 𝚞𝚗𝚜𝚎𝚗𝚍 𝚝𝚑𝚎 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚘𝚏 𝚋𝚘𝚝 𝚋𝚢 𝚛𝚎𝚙𝚕𝚢𝚒𝚗𝚐 "unsend" 𝚘𝚛 "rm 𝚝𝚘 𝚞𝚗𝚜𝚎𝚗𝚍 𝚝𝚑𝚒𝚜."`;

module.exports.config = {
  name: "bot",
  version: "1.0",
  credits: "churchill",
  description: "Guide for bot usage",
  commandCategory: "bot",
  hasPermssion: 0,
  cooldowns: 5,
  usages: "Type 'bot' or 'guide' to see info",
  role: 0,
  hasPrefix: false,
};

module.exports.run = async function ({ api, event }) {
  const { threadID, body } = event;

  if (body.toLowerCase() === "bot" || body.toLowerCase() === "guide") {
    try {
      const firstMessage = await api.sendMessage(first, threadID);

      await new Promise(resolve => setTimeout(resolve, 3000));
      await api.editMessage(second(""), firstMessage.messageID); // Removed prefix value

      await new Promise(resolve => setTimeout(resolve, 3000));
      await api.editMessage(third(""), firstMessage.messageID); // Removed admin value

      await new Promise(resolve => setTimeout(resolve, 3000));
      await api.editMessage(fourth(""), firstMessage.messageID); // Removed prefix value
    } catch (error) {
      console.error("Error while sending bot guide:", error);
    }
  }
};
