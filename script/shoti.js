module.exports.config = {
	name: "shoti",
	version: "1.0.0",
	role: 0,
	credits: "libyzxy0",
	description: "Generate a random TikTok video.",
	usages: "[]",
	cooldown: 0,
	hasPrefix: false,
};

module.exports.run = async ({ api, event, args }) => {
	api.setMessageReaction("⏳", event.messageID, (err) => {}, true);
	api.sendTypingIndicator(event.threadID, true);

	const { messageID, threadID } = event;
	const fs = require("fs");
	const axios = require("axios");
	const request = require("request");

	try {
		// New API endpoint without needing an API key
		const response = await axios.post(`https://shoti-api.adaptable.app/api/v1/request-f`);

		let path = __dirname + `/cache/shoti.mp4`;
		const file = fs.createWriteStream(path);
		const rqs = request(encodeURI(response.data.data.url));
		rqs.pipe(file);
		file.on(`finish`, () => {
			setTimeout(function () {
				api.setMessageReaction("✅", event.messageID, (err) => {}, true);
				return api.sendMessage({
					body: `𝖴𝗌𝖾𝗋𝗇𝖺𝗆𝖾 : @${response.data.data.user.username}\n𝖭𝗂𝖼𝗄𝗇𝖺𝗆𝖾 : ${response.data.data.user.nickname}\n𝖳𝗂𝗍𝗅𝖾 : ${response.data.data.title}\n𝖣𝗎𝗋𝖺𝗍𝗂𝗈𝗇 : ${response.data.data.duration}`,
					attachment: fs.createReadStream(path)
				}, threadID);
			}, 5000);
		});
		file.on(`error`, (err) => {
			api.sendMessage(`Error: ${err}`, threadID, messageID);
		});
	} catch (err) {
		api.sendMessage(`Error: ${err}`, threadID, messageID);
	};
};
