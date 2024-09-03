module.exports.config = {
  name: "pinterest",
  version: "1.0.0",
  role: 0,
  credits: "𝐌𝐀𝐑𝐉𝐇𝐔𝐍 𝐁𝐀𝐘𝐋𝐎𝐍",
  description: "Image search",
  hasPrefix: false,
  commandCategory: "Search",
  usages: "[Text]",
  aliases: ["pin"],
  cooldowns: 0,
};

module.exports.run = async function({ api, event, args }) {
  const axios = require("axios");
  const fs = require("fs-extra");
  const request = require("request");
  const keySearch = args.join(" ");
  if (!keySearch.includes("-")) return api.sendMessage('𝙿𝙻𝙴𝙰𝚂𝙴 𝙴𝙽𝚃𝙴𝚁 𝙰 𝙿𝚁𝙾𝙼𝙿𝚃\n\n𝙴𝚇𝙰𝙼𝙿𝙻𝙴 : pinterest ivana alawi - 5', event.threadID, event.messageID);
  const keySearchs = keySearch.substr(0, keySearch.indexOf('-'));
  const numberSearch = keySearch.split("-").pop() || 6;
  const res = await axios.get(`https://api.kenliejugarap.com/pinterestbymarjhun/?search=${encodeURIComponent(keySearchs)}`);
  const data = res.data && res.data.data;

  var num = 0;
  var imgData = [];
  for (var i = 0; i < parseInt(numberSearch); i++) {
    let path = __dirname + `/cache/${num+=1}.jpg`;
    let getDown = (await axios.get(`${data[i]}`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(path, Buffer.from(getDown, 'utf-8'));
    imgData.push(fs.createReadStream(__dirname + `/cache/${num}.jpg`));
  }

  const count = data.length;

  api.sendMessage({
    attachment: imgData,
    body: `${numberSearch} 𝙾𝚄𝚃 𝙾𝙵 ${count} 𝙿𝙸𝙲𝚂 𝙵𝙸𝙽𝙳𝙴𝙳\n✿━━━━━━━━━━✿\n𝚁𝙴𝚂𝚄𝙻𝚃𝚂 𝙾𝙵: ${keySearchs}`
  }, event.threadID, event.messageID);

  for (let ii = 1; ii < parseInt(numberSearch); ii++) {
    fs.unlinkSync(__dirname + `/cache/${ii}.jpg`)
  }
};
