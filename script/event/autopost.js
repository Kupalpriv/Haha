const axios = require('axios');
const cron = require('node-cron');
const fs = require('fs');

module.exports.config = {
    name: "autopost",
    version: "1.0.0",
    description: "post", 
    note: "if you change the cron time: {for hours < 12 * 60 * 60 * 1000} [0 */12 * * *], {for minutes < 60 * 60 * 1000} [*/60 * * *] tandaan moyan para di mag spam",
};

let lastPostTime = 0;

module.exports.handleEvent = async function ({ api, admin}) {

    async function Bibleverse() {
        const currentTime = Date.now();
        if (currentTime - lastPostTime < 7 * 60 * 60 * 1000) { 
            return;
        }
        lastPostTime = currentTime;

        try {
            const verseResponse = await axios.get('https://labs.bible.org/api/?passage=random&type=json');
            const verse = verseResponse.data[0];
            const formattedVerseMessage = 
            `🔔 Random 𝖡𝗂𝖻𝗅𝖾 𝖵𝖾𝗋𝗌𝖾:\n\n${verse.text}\n\n- ${verse.bookname} ${verse.chapter}:${verse.verse}`;
            api.createPost(`${formattedVerseMessage}`);
        } catch (error) {
            console.error(error);
        }
    }

    async function quotes() {
        const currentTime = Date.now();
        if (currentTime - lastPostTime < 3 * 60 * 60 * 1000) {
            return;
        }
        lastPostTime = currentTime;
        try {
            const response = await axios.get('https://api.forismatic.com/api/1.0/?method=getQuote&lang=en&format=json');
            const randomQuote = response.data.quoteText;
            const randomAuthor = response.data.quoteAuthor || "Cliffbot";


            const vid = [ 'https://scontent.xx.fbcdn.net/v/t42.3356-2/455957690_8773997195947097_6365810869425664193_n.mp4?_nc_cat=107&ccb=1-7&_nc_sid=4f86bc&_nc_eui2=AeFU2IMmByFolqQJ09NEBE-ipJjCy5tpUF2kmMLLm2lQXQDrstf0ZrzL_tfO7OdW00aNxKuqraZCizq5M6xe10f6&_nc_ohc=EjxDwNfgae4Q7kNvgFk67cE&_nc_ht=scontent.xx&oh=03_Q7cD1QF1T8NSIyeTNm_ST16jg_vIG0ttRR6P-EbD4Usgb7dCXA&oe=66C36445&dl=1' ]; //

            const j = Math.floor(Math.random() * vid.length);
            const video = vid[j];

            const images = [
                "https://i.imgur.com/p5UC6mk.jpeg",
                "https://i.imgur.com/nHG62W2.jpeg",
                "https://i.imgur.com/NfpInXC.jpeg",
                "https://i.imgur.com/k48dJBU.jpeg",
                "https://i.imgur.com/h9sATxR.jpeg",
                "https://i.imgur.com/vqlyCXj.jpeg",
                "https://i.imgur.com/ZWmgPnh.jpeg",
            ];  //change the background at your own

            const randomIndex = Math.floor(Math.random() * images.length);
            const randomImage = images[randomIndex];

            const guh = `https://api.popcat.xyz/quote?image=${randomImage}&text=${encodeURIComponent(randomQuote)}&font=Poppins-Bold&name=${encodeURIComponent(randomAuthor)}`;

           const response2 = await axios.get(guh, { responseType: 'stream' });

            await api.createPost({
                body: "<[ 𝗔𝗨𝗧𝗢𝗣𝗢𝗦𝗧 𝗤𝗨𝗢𝗧𝗘𝗦 ]>", 
                attachment: [response2.data], //[fs.createReadStream(video)]
                tags: [2],//[admin]
                baseState: 'EVERYONE',
            });
        } catch (error) {
            console.error('Limit posting');
        }
    }

    cron.schedule('0 */3 * * *', quotes, {
        scheduled: false,
        timezone: "Asia/Manila"
    });

    cron.schedule('0 */7 * * *', Bibleverse, {
        scheduled: true, //change true 
        timezone: "Asia/Manila"
    });
};
