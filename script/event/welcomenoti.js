const axios = require('axios');
const fs = require('fs');

module.exports.config = {
    name: "welcomenoti",
    version: "1.0.0",
};

module.exports.handleEvent = async function ({ api, event }) {
    if (event.logMessageType === "log:subscribe") {
        const addedParticipants = event.logMessageData.addedParticipants;
        const senderID = addedParticipants[0].userFbId;
        let name = await api.getUserInfo(senderID).then(info => info[senderID].name);

        // Truncate name if it's too long
        const maxLength = 15;
        if (name.length > maxLength) {
            name = name.substring(0, maxLength - 3) + '...';
        }

        // Fetching the group photo URL and thread name
        const groupInfo = await api.getThreadInfo(event.threadID);
        const groupIcon = groupInfo.imageSrc || "https://i.ibb.co/G5mJZxs/rin.jpg"; // Fallback image URL if group has no photo
        const memberCount = groupInfo.participantIDs.length;
        const groupName = groupInfo.threadName || "this group"; // Ensure a fallback value

        const background = groupInfo.imageSrc || "https://i.ibb.co/4YBNyvP/images-76.jpg"; // Use group image if available, otherwise default background

        const url = `https://ggwp-yyxy.onrender.com/canvas/welcome?name=${encodeURIComponent(name)}&groupname=${encodeURIComponent(groupName)}&groupicon=${encodeURIComponent(groupIcon)}&member=${memberCount}&uid=${senderID}&background=${encodeURIComponent(background)}`;

        try {
            const { data } = await axios.get(url, { responseType: 'arraybuffer' });
            const filePath = './script/cache/welcome_image.jpg';
            fs.writeFileSync(filePath, Buffer.from(data));

            api.sendMessage({
                body: `Welcome ${name} to ${groupName}!\n\n**GROUP RULES**\n\n1. Be respectful and kind.\n2. Keep chats on topic.\n3. No self-promotion without permission.\n4. Plss dont spamm the bot\n5. Avoid drama or gossip.\n6. Respect everyone's privacy.\n\nEnjoy your time here!`,
                attachment: fs.createReadStream(filePath)
            }, event.threadID, () => fs.unlinkSync(filePath));
        } catch (error) {
            console.error("Error fetching welcome image:", error);

            // Fallback message if fetching the image fails
            api.sendMessage({
                body: `Welcome ${name} to ${groupName}!\n\n**GROUP RULES**\n\n1. Be respectful and kind.\n2. Keep chats on topic.\n3. No self-promotion without permission.\n4. Keep content family-friendly.\n5. Avoid drama or gossip.\n6. Respect everyone's privacy.\n\nEnjoy your time here!`
            }, event.threadID);
        }
    }
};
