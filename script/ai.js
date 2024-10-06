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
    name: 'ai',
    version: '1.0.1',
    role: 0,
    hasPrefix: false,
    aliases: ['gpt4'],
    description: 'Get a response from GPT-4',
    usage: 'ai [your message]',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const pogi = event.senderID;
    const chilli = args.join(' ');

    if (!chilli) {
        return api.sendMessage('Please provide a prompt, for example: ai What is the meaning of life?', event.threadID, event.messageID);
    }

    const bayot = await api.getUserInfo(pogi);
    const lubot = bayot[pogi].name;

    const pangit = await new Promise((resolve, reject) => {
        api.sendMessage({
            body: '𝘼𝙣𝙨𝙬𝙚𝙧𝙞𝙣𝙜 𝙥𝙡𝙨𝙨 𝙬𝙖𝙞𝙩....',
        }, event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        }, event.messageID);
    });

    
    const apiUrl = `https://rest-api-production-5054.up.railway.app/gpt4om?prompt=${encodeURIComponent(chilli)}&uid=${pogi}`;

    try {
        const response = await axios.get(apiUrl);
        const gpt4Response = response.data.content || 'No response from GPT-4.';

        const gothicResponse = convertToGothic(gpt4Response);

        const formattedResponse = 
`🧩 | 𝘾𝙝𝙞𝙡𝙡𝙞 𝙂𝙥𝙩
━━━━━━━━━━━━━━━━━━
${gothicResponse}
━━━━━━━━━━━━━━━━━━
👤 𝙰𝚜𝚔𝚎𝚍 𝚋𝚢: ${lubot}`;

        await api.editMessage(formattedResponse, pangit.messageID);

    } catch (maasim) {
        console.error('Error:', maasim);
        await api.editMessage('An error occurred. Please try again later.', pangit.messageID);
    }
};
