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
    name: 'blackbox',
    version: '1.0.1',
    role: 0,
    hasPrefix: false,
    aliases: ['bb'],
    description: 'Get a response from Blackbox and convert to Gothic font',
    usage: 'bb [your message]',
    credits: 'churchill',
    cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
    const pogi = event.senderID;
    const chilli = args.join(' ');

    if (!chilli) {
        return api.sendMessage('Please provide a prompt, for example: bb What is AI?', event.threadID, event.messageID);
    }

    const bayot = await api.getUserInfo(pogi);
    const lubot = bayot[pogi].name;

    const searchingMessage = await new Promise((resolve, reject) => {
        api.sendMessage({
            body: `⚫ Blackbox is searching for "${chilli}"...`,
        }, event.threadID, (err, info) => {
            if (err) return reject(err);
            resolve(info);
        }, event.messageID);
    });

    const apiUrl = `https://betadash-api-swordslush.vercel.app/blackbox?ask=${encodeURIComponent(chilli)}`;

    try {
        const response = await axios.get(apiUrl);
        const blackboxResponse = response.data.Response || 'No response from Blackbox.';

        const gothicResponse = convertToGothic(blackboxResponse);

        const formattedResponse = 
`${gothicResponse}

👤 Asked by: ${lubot}`;

        await api.editMessage(searchingMessage.messageID, formattedResponse);

    } catch (error) {
        console.error('Error:', error);
        await api.editMessage(searchingMessage.messageID, 'An error occurred while fetching data from Blackbox. Please try again later.');
    }
};
