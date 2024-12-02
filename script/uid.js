const cheerio = require('cheerio');
const axios = require('axios');
const regExCheckURL = /https:\/\/www\.facebook\.com\/[a-zA-Z0-9\.]+/;

async function findUid(link) {
  try {
    const response = await axios.post(
      'https://seomagnifier.com/fbid',
      new URLSearchParams({
        facebook: '1',
        sitelink: link,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Cookie: 'PHPSESSID=0d8feddd151431cf35ccb0522b056dc6',
        },
      }
    );

    const id = response.data;
    if (!isNaN(id)) {
      return id;
    }

    const html = await axios.get(link);
    const $ = cheerio.load(html.data);
    const metaContent = $('meta[property="al:android:url"]').attr('content');
    if (metaContent) {
      const uid = metaContent.split('/').pop();
      return uid;
    }

    throw new Error('UID not found.');
  } catch (error) {
    throw new Error('An error occurred while fetching UID.');
  }
}

module.exports.config = {
  name: 'uid',
  role: 0,
  credits: 'Churchill',
  description: 'Get a user’s Facebook UID.',
  hasPrefix: true,
  usages: '{p}uid | {p}uid @mention | {p}uid <fblink>',
  cooldown: 5,
  aliases: [],
};

module.exports.run = async function ({ api, event, args }) {
  if (!args[0] && Object.keys(event.mentions).length === 0) {
    const senderID = event.messageReply?.senderID || event.senderID;
    return api.shareContact(senderID, senderID, event.threadID);
  }

  if (Object.keys(event.mentions).length > 0) {
    for (const mentionID in event.mentions) {
      await api.shareContact(mentionID, mentionID, event.threadID);
    }
    return;
  }

  if (args[0]?.match(regExCheckURL)) {
    for (const link of args) {
      try {
        const uid = await findUid(link);
        await api.shareContact(uid, uid, event.threadID);
      } catch {
        await api.sendMessage(`❌ Unable to fetch UID for ${link}.`, event.threadID, event.messageID);
      }
    }
  }
};
