const fs = require('fs');

module.exports.config = {
    name: "welcomenoti",
    version: "1.1.0",
};

module.exports.handleEvent = async function ({ api, event }) {
    if (event.logMessageType === "log:subscribe") {
        const addedParticipants = event.logMessageData.addedParticipants;
        const threadInfo = await api.getThreadInfo(event.threadID);
        const groupName = threadInfo.threadName || "this group";
        const memberCount = threadInfo.participantIDs.length;

        for (let newParticipant of addedParticipants) {
            let userID = newParticipant.userFbId;
            
        
            if (userID === api.getCurrentUserID()) continue;
            
            
            const userInfo = await api.getUserInfo(userID);
            let name = userInfo[userID].name;
            
        
            const maxLength = 15;
            if (name.length > maxLength) {
                name = name.substring(0, maxLength - 3) + '...';
            }

        
            const welcomeMessage = `👋 Hello ${name}! Welcome to ${groupName} 🤗, you're the ${memberCount}th member of this group. Enjoy!`;

            
            api.shareContact(welcomeMessage, userID, event.threadID);
        }
    }
};
