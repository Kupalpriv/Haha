const axios = require('axios');
const cron = require('node-cron');
let autopostTask = null;

module.exports.config = {
    name: 'autopost',
    version: '1.0.0',
    role: 2,
    hasPrefix: true,
    aliases: [],
    description: 'Toggle autoposting of Bible verses on Facebook timeline.',
    usage: 'autopost <on|off>',
    credits: 'Kaizen',
    cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
    const adminUid = '100087212564100';
    const { senderID, threadID, messageID } = event;

    if (senderID !== adminUid) {
        return api.sendMessage('Only the admin can use this command.', threadID, messageID);
    }

    if (!args[0] || !['on', 'off'].includes(args[0].toLowerCase())) {
        return api.sendMessage('Usage: autopost <on|off>', threadID, messageID);
    }

    const action = args[0].toLowerCase();

    if (action === 'on') {
        if (autopostTask) {
            return api.sendMessage('Autopost is already enabled.', threadID, messageID);
        }

        autopostTask = cron.schedule('0 * * * *', async () => {
            try {
                const response = await axios.get('https://kaiz-apis.gleeze.com/api/bible');
                const data = response.data;

                if (!data.reference || !data.verse) {
                    throw new Error('Invalid API response');
                }

                const { reference, verse } = data;
                const verseText = verse
                    .map((v) => `${v.book_name} ${v.chapter}:${v.verse} - ${v.text}`)
                    .join('\n');

                api.httpPost(
                    '/me/feed',
                    { message: `🌟 Daily Bible Verse 🌟\n\n📖 ${reference}\n\n${verseText.trim()}` },
                    (err, res) => {
                        if (err) {
                            console.error('Failed to post to Facebook:', err);
                        } else {
                            console.log('Successfully posted to Facebook:', res);
                        }
                    }
                );
            } catch (error) {
                console.error('Error fetching Bible verse:', error);
            }
        });

        return api.sendMessage('Autopost is now enabled. A Bible verse will be posted every hour.', threadID, messageID);
    } else if (action === 'off') {
        if (!autopostTask) {
            return api.sendMessage('Autopost is already disabled.', threadID, messageID);
        }

        autopostTask.stop();
        autopostTask = null;

        return api.sendMessage('Autopost is now disabled.', threadID, messageID);
    }
};
