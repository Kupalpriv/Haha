const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "welcomenoti",
    version: "1.0.0",
    credits: "Churchill",
    description: "Welcome notification with picture support",
};

module.exports.handleEvent = async function ({ api, event }) {
    const logMessageType = event.logMessageType;
    const threadID = event.threadID;

    if (logMessageType === "log:subscribe") {
        try {
            const { threadName, participantIDs } = await api.getThreadInfo(threadID);
            const addedParticipants = event.logMessageData.addedParticipants;

            for (const newParticipant of addedParticipants) {
                const userID = newParticipant.userFbId;
                const username = newParticipant.fullName;
                const memberCount = participantIDs.length;

                if (userID !== api.getCurrentUserID()) {
                    const apiUrl = `https://kaiz-apis.gleeze.com/api/welcome?username=${encodeURIComponent(username)}&avatarUrl=https://graph.facebook.com/${userID}/picture?width=720&height=720&groupname=${encodeURIComponent(threadName || "this group")}&bg=https://i.ibb.co/4YBNyvP/images-76.jpg&memberCount=${memberCount}`;
                    const imagePath = path.join(__dirname, "cache", `welcome_${userID}.png`);

                    try {
                        const response = await axios({
                            method: "get",
                            url: apiUrl,
                            responseType: "stream",
                        });

                        const writer = fs.createWriteStream(imagePath);
                        response.data.pipe(writer);

                        await new Promise((resolve, reject) => {
                            writer.on("finish", resolve);
                            writer.on("error", reject);
                        });

                        await api.sendMessage(
                            {
                                body: `👋 Welcome to ${threadName || "this group"}, ${username}! You're the ${memberCount}th member 🎉`,
                                attachment: fs.createReadStream(imagePath),
                            },
                            threadID
                        );

                        fs.unlinkSync(imagePath); // Clean up the image file after sending
                    } catch (error) {
                        console.error("Error fetching welcome image:", error.message);
                        await api.sendMessage(
                            `👋 Welcome to ${threadName || "this group"}, ${username}! You're the ${memberCount}th member 🎉`,
                            threadID
                        );
                    }
                }
            }
        } catch (error) {
            console.error("Error in welcomenoti:", error.message);
        }
    }
};
