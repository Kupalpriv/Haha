const moment = require('moment-timezone');

module.exports.config = {
    name: "autogreet",
    version: "69",
    credits: "cliff",
    description: "autogreet"
};

let lastMessage = 0;

module.exports.handleEvent = async function ({ api, event }) {
    const arrayData = {
        "01:00:00 AM": {
            message: "🌙 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 🌙\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 01:00 AM\n\nLate night? Remember, rest is important too."
        },
        "02:00:00 AM": {
            message: "🌙 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 🌙\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 02:00 AM\n\nMatulog na kayo, ang pagpupuyat ay nakakapayat."
        },
        "03:00:00 AM": {
            message: "🌌 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 🌌\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 03:00 AM\n\nIf you're still awake, it's time to consider getting some sleep."
        },
        "04:00:00 AM": {
            message: "🌅 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 🌅\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 04:00 AM\n\nGood early morning! The quiet hours can be the most productive."
        },
        "05:00:00 AM": {
            message: "🌅 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 🌅\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 05:00 AM\n\nGood morning! 🌞 Let's start the day with energy and positivity. Ready for another day of possibilities?"
        },
        "06:00:00 AM": {
            message: "🌄 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 🌄\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 06:00 AM\n\nRise and shine! 🌄 The world is waiting for your brilliance today."
        },
        "07:00:00 AM": {
            message: "🍳 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 🍳\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 07:00 AM\n\nNag-almusal na ba kayo? Wag palipas ng gutom."
        },
        "08:00:00 AM": {
            message: "🌞 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 🌞\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 08:00 AM\n\nGood morning! 🌞 Time to fuel up with some positivity and a smile."
        },
        "09:00:00 AM": {
            message: "🌸 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 🌸\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 09:00 AM\n\nGood morning! 🌸 May your day be as bright as the morning sun."
        },
        "10:00:00 AM": {
            message: "🌻 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 🌻\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 10:00 AM\n\nGood morning! 🌻 A fresh start for new opportunities. Make the most of it!"
        },
        "11:00:00 AM": {
            message: "🌟 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 🌟\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 11:00 AM\n\nGood morning! 🌟 Let today be another step towards your goals."
        },
        "12:00:00 PM": {
            message: "🌞 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 🌞\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 12:00 PM\n\nGood afternoon! Kumain na kayo"
        },
        "01:00:00 PM": {
            message: "🌤️ 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 🌤️\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 01:00 PM\n\nGood afternoon! 🌅 Hope your day is going well. Let's keep the momentum going!"
        },
        "02:00:00 PM": {
            message: "🌞 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 🌞\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 02:00 PM\n\n Mag miryenda muna kayo"
        },
        "03:00:00 PM": {
            message: "🌳 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 🌳\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 03:00 PM\n\nGood afternoon! 🌳 Stay focused and stay motivated."
        },
        "04:00:00 PM": {
            message: "🌼 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 🌼\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 04:00 PM\n\nAfternoon! 🌼 Let the sun guide your path to success today."
        },
        "05:00:00 PM": {
            message: "🍚 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 🍚\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 05:00 PM\n\nGood evening! 🌙 Relax and let go of the day's stress."
        },
        "06:00:00 PM": {
            message: "🌇 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 🌇\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 06:00 PM\n\nGood evening! 🌇 Time to unwind and reflect on your day."
        },
        "07:00:00 PM": {
            message: "🌠 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 🌠\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 07:00 PM\n\nGood evening! 🌠 Time to recharge for another day of greatness."
        },
        "08:00:00 PM": {
            message: "🌜 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 🌜\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 08:00 PM\n\nKumain na ba kayo? Magandang gabi sa inyong lahat!"
        },
        "09:00:00 PM": {
            message: "🌕 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 🌕\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 09:00 PM\n\nGood evening! 🌕 End your day with positive thoughts and calmness."
        },
        "10:00:00 PM": {
            message: "🌠 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 🌠\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 10:00 PM\n\nGood evening! 🌠 Rest well and prepare for a bright tomorrow."
        },
        "11:00:00 PM": {
            message: "💤 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 💤\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 11:00 PM\n\nEvening! 🌝 Take time to enjoy the quiet moments tonight."
        },
        "12:00:00 AM": {
            message: "🌙 𝗔𝗨𝗧𝗢𝗚𝗥𝗘𝗘𝗧 🌙\n▬▬▬▬▬▬▬▬▬▬▬▬▬\n⏰ time now: 12:00 AM\n\nMidnight is here. Rest well and dream big!"
        }
    };

    const checkTimeAndSendMessage = async () => {
        const now = moment().tz('Asia/Manila');
        const currentTime = now.format('hh:mm:ss A');

        const messageData = arrayData[currentTime];

        if (messageData) {
            const dateNow = Date.now();
            if (dateNow - lastMessage < 1 * 60 * 60 * 1000) { 
                return;
            }
            lastMessage = dateNow;

            try {
                const threadList = await api.getThreadList(50, null, ["INBOX"]);
                threadList.forEach(async (thread) => {
                    const threadID = thread.threadID;
                    if (thread.isGroup && thread.name !== thread.threadID && thread.threadID !== event.threadID) {
                        api.sendMessage({ body: messageData.message }, threadID);
                    }
                });
            } catch (error) {
                console.error();
            }
        }

        const nextMinute = moment().add(1, 'minute').startOf('minute');
        const delay = nextMinute.diff(moment());
        setTimeout(checkTimeAndSendMessage, delay);
    };

    checkTimeAndSendMessage();
}
