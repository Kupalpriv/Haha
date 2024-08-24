const axios = require('axios');
const cron = require('node-cron');

module.exports.config = {
    name: "autopost",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "chill",
    description: "Automatically posts a random Bible verse every 2 hours",
    commandCategory: "Utility",
    cooldowns: 0,
};

module.exports.handleEvent = function({ api }) {
    // Schedule the task to run every 2 hours
    cron.schedule(
        '0 */2 * * *', // Cron expression for every 2 hours
        async () => {
            try {
                // Fetch a random Bible verse from the API
                const response = await axios.get('https://deku-rest-api.gleeze.com/bible');
                const bibleVerse = response.data.verse;
                const bibleReference = response.data.reference;

                // Construct the message
                const message = `📖 ${bibleVerse} \n- ${bibleReference}`;

                // Prepare the form data for posting
                const formData = {
                    av: api.getCurrentUserID(),
                    fb_dtsg: global.Fca.Data.AppState.find(item => item.name === 'fb_dtsg').value,
                    privacyx: 300645083384735,
                    target_type: 'timeline',
                    text: message,
                    timeline_visibility: 1
                };

                // Post the message
                api.httpPost('https://www.facebook.com/api/graphql/', formData, (err, info) => {
                    if (err) return console.error('Error posting the message:', err);

                    try {
                        if (typeof info == "string") {
                            info = JSON.parse(info.replace("for (;;);", ""));
                        }

                        const postID = info.data.story_create.story.legacy_story_hideable_id;
                        if (!postID) throw info.errors;

                        const postLink = `https://www.facebook.com/${api.getCurrentUserID()}/posts/${postID}`;

                        // Log the post link to the console
                        console.log(`[AUTO POST] Link: ${postLink}`);
                    } catch (e) {
                        return console.error('Error handling post info:', e);
                    }
                });
            } catch (error) {
                console.error('Error fetching the Bible verse or posting:', error);
            }
        },
        {
            scheduled: true,
            timezone: "Asia/Manila"
        }
    );
};
