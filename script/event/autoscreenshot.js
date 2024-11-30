const axios = require("axios");

module.exports.config = {
    name: "autoscreenshot",
    version: "1.0.0",
    description: "Automatically takes screenshots of all URLs shared in the chat, including TikTok, Instagram, and Facebook links.",
};

module.exports.handleEvent = async function ({ api, event }) {
    const { body, threadID, messageID } = event;

    // Extended regex to capture a wide range of URLs, including TikTok, Instagram, Facebook, and general URLs
    const urlRegex = /(https?:\/\/(?:www\.)?(?:tiktok\.com|facebook\.com|instagram\.com|[^\s]+(?:\.com|\.net|\.org|\.co|\.io|\.gov|\.edu)[^\s]*))/g;
    const urls = body?.match(urlRegex);

    if (urls && urls.length > 0) {
        for (const url of urls) {
            const screenshotApiUrl = `https://ccprojectapis.ddns.net/api/screenshot?url=${encodeURIComponent(url)}`;

            try {
                const response = await axios.get(screenshotApiUrl);
                const screenshotUrl = response.data.screenshotURL;

                if (!screenshotUrl) throw new Error("No screenshot URL returned from API.");

                const imageStream = await axios({
                    url: screenshotUrl,
                    method: "GET",
                    responseType: "stream",
                });

                await api.sendMessage(
                    {
                        attachment: imageStream.data,
                    },
                    threadID,
                    messageID
                );
            } catch (error) {
                console.error(`Error generating screenshot for URL ${url}:`, error.message);
            }
        }
    }
};
