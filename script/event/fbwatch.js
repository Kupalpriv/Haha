const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const cheerio = require("cheerio");

module.exports.config = {
  name: "FBWatchDL",
  version: "1.0.0",
  credits: "Cliff",
  description: "Download facebook URL" 
};

const downloadDirectory = path.resolve(__dirname, 'cache');

async function fbDownloader(url) {
  try {
    const response1 = await axios({
      method: 'POST',
      url: 'https://snapsave.app/action.php?lang=en',
      headers: {
        "accept": "*/*",
        "accept-language": "vi,en-US;q=0.9,en;q=0.8",
        "content-type": "multipart/form-data",
        "sec-ch-ua": "\"Chromium\";v=\"110\", \"Not A(Brand\";v=\"24\", \"Microsoft Edge\";v=\"110\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "Referer": "https://snapsave.app/en",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      data: { url }
    });

    console.log('Facebook Downloader Response:', response1.data);
    let html;
    const evalCode = response1.data.replace('return decodeURIComponent', 'html = decodeURIComponent');
    eval(evalCode);
    html = html.split('innerHTML = "')[1].split('";\n')[0].replace(/\\"/g, '"');
    const $ = cheerio.load(html);
    const download = [];
    const tbody = $('table').find('tbody');
    const trs = tbody.find('tr');
    trs.each(function (i, elem) {
      const trElement = $(elem);
      const tds = trElement.children();
      const quality = $(tds[0]).text().trim();
      const url = $(tds[2]).children('a').attr('href');
      if (url != undefined) {
        download.push({ quality, url });
      }
    });
    return { success: true, video_length: $("div.clearfix > p").text().trim(), download };
  } catch (err) {
    console.error('Error in Facebook Downloader:', err);
    return { success: false };
  }
}

module.exports.handleEvent = async function ({ api, event }) {
  try {
    const fbWatchRegex = /https:\/\/fb\.watch\/[a-zA-Z0-9_-]+/i;
    if (event.body !== null) {
      const url = event.body;
      if (fbWatchRegex.test(url)) {
        const res = await fbDownloader(url);
        if (res.success && res.download && res.download.length > 0) {
          const videoUrl = res.download[0].url;
          const response = await axios.get(videoUrl, { responseType: "stream" });
          const filePath = path.join(downloadDirectory, `${Date.now()}.mp4`);
          const fileStream = fs.createWriteStream(filePath);
          response.data.pipe(fileStream);
          fileStream.on('finish', () => {
            const fileSize = fs.statSync(filePath).size / (1024 * 1024); // in MB
            if (fileSize > 25) {
              api.sendMessage("The file is too large, cannot be sent", event.threadID, () => fs.unlinkSync(filePath), event.messageID);
            } else {
              const messageBody = `𝖠𝗎𝗍𝗈 𝖣𝗈𝗐𝗇 FB.Watch\n\n𝗬𝗔𝗓𝗞𝗬 𝗕𝗢𝗧 𝟭.𝟬.𝟬𝘃`;
              api.sendMessage({
                body: messageBody,
                attachment: fs.createReadStream(filePath)
              }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
            }
          });
        }
      }
    }
  } catch (err) {
    console.error();
  }
};
