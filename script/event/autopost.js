const axios = require('axios');
const cron = require('node-cron');

let post = {};

post["config"] = {
    name: "autopost",
    version: "1.0.0",
    description: "post",
    note: "if you change the cron time: {for hours < 12 * 60 * 60 * 1000} [0 */12 * * *], {for minutes < 60 * 60 * 1000} [*/60 * * * *] tandaan moyan para di mag spam",
};

let lastPostTime = 0;

post["handleEvent"] = async function ({ api, admin }) {

    async function sendMotivation() {
      const currentTime = Date.now();
        if (currentTime - lastPostTime < 40 * 60 * 1000) { /** for hours [< 30 * 60 * 60 * 1000] **/
            return;
        }
        lastPostTime = currentTime;
        try {
            const response = await axios.get("https://raw.githubusercontent.com/JamesFT/Database-Quotes-JSON/master/quotes.json");
            const quotes = response.data;

            const randomIndex = Math.floor(Math.random() * quotes.length);
            const randomQuote = quotes[randomIndex];

            const formattedQuoteMessage = `🔔 Random 𝖬𝗈𝗍𝗂𝗏𝖺𝗍𝗂𝗈𝗇:\n\n${randomQuote.quoteText}\n\n- ${randomQuote.quoteAuthor}`;
            await api.createPost(formattedQuoteMessage);
        } catch (error) {
            console.error();
        }
    }

/**
    async function Bibleverse() {
        const currentTime = Date.now();
        if (currentTime - lastPostTime < 2 * 60 * 1000) {
            return;
        }
        lastPostTime = currentTime;

        try {
            const verseResponse = await axios.get('https://labs.bible.org/api/?passage=random&type=json', {
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  }
                });

                const verse = verseResponse.data[0];

                if (verse && verse.text && verse.bookname && verse.chapter && verse.verse) {
                  const formattedVerseMessage = `🔔 Random 𝖡𝗂𝖻𝗅𝖾 𝖵𝖾𝗋𝗌𝖾:\n\n${verse.text}\n\n- ${verse.bookname} ${verse.chapter}:${verse.verse}`;
                  await api.createPost(formattedVerseMessage);
                } else {
                  console.log();
                }
              } catch (error) {
                console.error();
              }
            } **/

    async function quotes() {
        const currentTime = Date.now();
        if (currentTime - lastPostTime < 12 * 60 * 60 * 1000) { /** for minutes [< 12 * 60 1000] **/
            return;
        }
        lastPostTime = currentTime;

        try {
            const response = await axios.get('https://api.forismatic.com/api/1.0/?method=getQuote&lang=en&format=json');
            const randomQuote = response.data.quoteText;
            const randomAuthor = response.data.quoteAuthor || "Cliffbot";

            const images = [
                "https://i.imgur.com/p5UC6mk.jpeg",
                "https://i.imgur.com/nHG62W2.jpeg",
                "https://i.imgur.com/NfpInXC.jpeg",
                "https://i.imgur.com/k48dJBU.jpeg",
                "https://i.imgur.com/h9sATxR.jpeg",
                "https://i.imgur.com/vqlyCXj.jpeg",
                "https://i.imgur.com/ZWmgPnh.jpeg",
            ];

            const randomIndex = Math.floor(Math.random() * images.length);
            const randomImage = images[randomIndex];

            const quoteImageURL = `https://api.popcat.xyz/quote?image=${randomImage}&text=${encodeURIComponent(randomQuote)}&font=Poppins-Bold&name=${encodeURIComponent(randomAuthor)}`;

            const response2 = await axios.get(quoteImageURL, { responseType: 'stream' });

            await api.createPost({
                body: "<[ 𝗔𝗨𝗧𝗢𝗣𝗢𝗦𝗧 𝗤𝗨𝗢𝗧𝗘𝗦 ]>",
                attachment: [response2.data],
                tags: [admin],
                baseState: 'EVERYONE',
            });
        } catch (error) {
            console.error();
        }
    }

    cron.schedule('0 */12 * * *', quotes, { // every  12 hours
        scheduled: true,
        timezone: "Asia/Manila"
    });

    cron.schedule('*/40 * * * *', sendMotivation, { // every 40 minutes 
        scheduled: true,
        timezone: "Asia/Manila"
    });
};


/** function baho(api) {
cron.schedule("", async function () { **/

/**      const currentTime = Date.now();
if (currentTime - lastPostTime < 30 * 60 * 1000) {
return;
}

lastPostTime = currentTime;       

try {
const response = await axios.get("https://catfact.ninja/fact");

const apple = response.data.fact;
const message = `𝚁𝙰𝙽𝙳𝙾𝙼 𝙲𝙰𝚃 𝙵𝙰𝙲𝚃: “${apple}”`;

api.setOptions({
selfListen: false, 
});
baho(api);

};

const formData = {
input: {
composer_entry_point: "inline_composer",
composer_source_surface: "timeline",
idempotence_token: `${Date.now()}_FEED`,
source: "WWW",
message: {
text: message,

},

audience: {

privacy: {

base_state: "EVERYONE",

},

},

actor_id: api.getCurrentUserID(),

},

};


const postResult = await api.httpPost(

"https://www.facebook.com/api/graphql/",

{

av: api.getCurrentUserID(),

fb_api_req_friendly_name: "ComposerStoryCreateMutation",

fb_api_caller_class: "RelayModern",

doc_id: "7711610262190099",

variables: JSON.stringify(formData),

}

);


const postID = postResult.data.story_create.story.legacy_story_hideable_id;

const postLink = `https://www.facebook.com/${api.getCurrentUserID()}/posts/${postID}`;
api.sendMessage(`[AUTO POST]\nLink: ${postLink}`, admin); 

} catch (error) {
console.error();
}
}, {
scheduled: true,
timezone: "Asia/Manila",
});
} **/

module.exports = post;
