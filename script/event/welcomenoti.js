module.exports.config = {
    name: "welcomenoti",
    version: "1.0.0",
};

module.exports.handleEvent = async function ({ api, event }) {
    const logMessageType = event.logMessageType;
    const threadID = event.threadID;

    // Check if the event is related to a new participant being added
    if (logMessageType === "log:subscribe") {
        try {
            let { threadName, participantIDs } = await api.getThreadInfo(threadID);
            let addedParticipants = event.logMessageData.addedParticipants;

            for (let newParticipant of addedParticipants) {
                let userID = newParticipant.userFbId;

                // If the new participant is not the bot itself
                if (userID !== api.getCurrentUserID()) {
                    api.shareContact(
                        `👋 Hello! Welcome to ${threadName || "this group"} 🤗, you're the ${participantIDs.length}th member on this group. Enjoy! 🤗`,
                        userID,
                        threadID
                    );
                }
            }
        } catch (e) {
            console.error(e.message);
        }
    }
};
