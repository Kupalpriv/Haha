module.exports.config = {
    name: "welcomenoti",
    version: "1.0.0",
    credits: "Churchill",
    description: "Send a welcome message to new group members using shareContact."
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
                const userName = newParticipant.fullName; // New participant's name

                if (userID !== api.getCurrentUserID()) {
                    const message = `🌟 Hi, ${userName}!\n┌────── ～●～ ──────┐\n----- Welcome to ${threadName || "this group"} -----\n└────── ～●～ ──────┘\nYou're the ${participantIDs.length}th member of this group, please enjoy! 🥳♥`;

                    await api.shareContact(message, userID, threadID);
                }
            }
        } catch (error) {
            console.error("Error sending welcome message:", error);
        }
    }
};
