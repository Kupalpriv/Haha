const axios = require('axios');

const gothicFont = {
  A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬", N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱",
  S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹", 
  a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂",
  j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋",
  s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
  0: "𝟢", 1: "𝟣", 2: "𝟤", 3: "𝟥", 4: "𝟦", 5: "𝟧", 6: "𝟨", 7: "𝟩", 8: "𝟪", 9: "𝟫"
};

const convertToGothic = (text) => {
  return text.split('').map(char => gothicFont[char] || char).join('');
};

module.exports.config = {
  name: 'help',
  version: '1.0.0',
  role: 0,
  hasPrefix: true,
  aliases: ['info'],
  description: "Beginner's guide",
  usage: "Help [page] or [command]",
  credits: 'Developer',
};

module.exports.run = async function({ api, event, enableCommands, args, Utils, prefix }) {
  const input = args.join(' ');
  try {
    const eventCommands = enableCommands[1].handleEvent;
    const commands = enableCommands[0].commands;
    
    if (!input) {
      const pages = 20;
      let page = 1;
      let start = (page - 1) * pages;
      let end = start + pages;
      let helpMessage = `📋 | ${convertToGothic('𝖢𝖬𝖣𝖲 𝖫𝗂𝗌𝗍')}: 〔${prefix}〕\n`;
      helpMessage += `𝖳𝗈𝗍𝖺𝗅 ${convertToGothic('𝖢𝗈𝗆𝗆𝖺𝗇𝖽𝗌')}: ${commands.length}🏷️\n\n`;

      for (let i = start; i < Math.min(end, commands.length); i++) {
        helpMessage += `${convertToGothic(`\t${i + 1}. 「 ${prefix}${commands[i]} 」`)}\n`;
      }

      helpMessage += `\n${convertToGothic('𝖥𝗈𝗋 𝖺𝗅𝗅 𝖼𝗆𝖽𝗌, 𝗍𝗒𝗉𝖾 "𝗁𝖾𝗅𝗉 𝖺𝗅𝗅"')}`;
      api.sendMessage(helpMessage, event.threadID, event.messageID);

    } else if (input.toLowerCase() === 'all') {
      let allCommandsMessage = `📋 | ${convertToGothic('𝖢𝖬𝖣𝖲 𝖫𝗂𝗌𝗍')}: 〔${prefix}〕\n`;
      allCommandsMessage += `𝖳𝗈𝗍𝖺𝗅 ${convertToGothic('𝖢𝗈𝗆𝗆𝖺𝗇𝖽𝗌')}: ${commands.length}🏷️\n\n`;

      commands.forEach((cmd, index) => {
        allCommandsMessage += `${convertToGothic(`\t${index + 1}. 「 ${prefix}${cmd} 」`)}\n`;
      });

      api.sendMessage(allCommandsMessage, event.threadID, event.messageID);
    } else if (!isNaN(input)) {
      const page = parseInt(input);
      const pages = 20;
      let start = (page - 1) * pages;
      let end = start + pages;
      let helpMessage = `📋 | ${convertToGothic('𝖢𝖬𝖣𝖲 𝖫𝗂𝗌𝗍')}: 〔${prefix}〕\n`;
      helpMessage += `𝖳𝗈𝗍𝖺𝗅 ${convertToGothic('𝖢𝗈𝗆𝗆𝖺𝗇𝖽𝗌')}: ${commands.length}🏷️\n\n`;

      for (let i = start; i < Math.min(end, commands.length); i++) {
        helpMessage += `${convertToGothic(`\t${i + 1}. 「 ${prefix}${commands[i]} 」`)}\n`;
      }

      helpMessage += `\nPage ${page} of ${Math.ceil(commands.length / pages)}`;
      api.sendMessage(helpMessage, event.threadID, event.messageID);
    } else {
      const command = [...Utils.handleEvent, ...Utils.commands].find(([key]) => key.includes(input.toLowerCase()))?.[1];
      if (command) {
        const { name, version, role, aliases = [], description, usage, credits, cooldown } = command;
        const roleMessage = role !== undefined ? (role === 0 ? '➛ Permission: user' : (role === 1 ? '➛ Permission: admin' : (role === 2 ? '➛ Permission: thread Admin' : ''))) : '';
        const aliasesMessage = aliases.length ? `➛ Aliases: ${aliases.join(', ')}\n` : '';
        const descriptionMessage = description ? `Description: ${description}\n` : '';
        const usageMessage = usage ? `➛ Usage: ${usage}\n` : '';
        const creditsMessage = credits ? `➛ Credits: ${credits}\n` : '';
        const versionMessage = version ? `➛ Version: ${version}\n` : '';
        const cooldownMessage = cooldown ? `➛ Cooldown: ${cooldown} second(s)\n` : '';
        const message = ` 「 Command 」\n\n➛ Name: ${name}\n${versionMessage}${roleMessage}\n${aliasesMessage}${descriptionMessage}${usageMessage}${creditsMessage}${cooldownMessage}`;
        api.sendMessage(message, event.threadID, event.messageID);
      } else {
        api.sendMessage('Command not found.', event.threadID, event.messageID);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports.handleEvent = async function({ api, event, prefix }) {
  const { threadID, messageID, body } = event;
  const message = prefix ? 'This is my prefix: ' + prefix : "Sorry, I don't have a prefix";
  if (body?.toLowerCase().startsWith('prefix')) {
    api.sendMessage(message, threadID, messageID);
  }
};
