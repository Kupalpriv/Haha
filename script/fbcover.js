const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: 'fbcover',
    version: '1.0.0',
    role: 0,
    hasPrefix: true,
    aliases: [],
    description: 'Generate a custom Facebook cover image',
    usage: 'fbcover name | subname | sdt | address | email | color',
    credits: 'churchill',
    cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
    const input = args.join(' ').split('|').map(item => item.trim());

    if (input.length < 6) {
        return api.sendMessage('Please provide all necessary details in the format: fbcover name | subname | sdt | address | email | color', event.threadID, event.messageID);
    }

    const [name, subname, sdt, address, email, color] = input;
    const apiUrl = `https://deku-rest-api.gleeze.com/canvas/fbcover?name=${encodeURIComponent(name)}&subname=${encodeURIComponent(subname)}&sdt=${encodeURIComponent(sdt)}&address=${encodeURIComponent(address)}&email=${encodeURIComponent(email)}&uid=${event.senderID}&color=${encodeURIComponent(color)}`;

    try {
        const response = await axios({
            url: apiUrl,
            method: 'GET',
            responseType: 'arraybuffer'
        });

        const buffer = Buffer.from(response.data, 'binary');
        const filePath = path.resolve(__dirname, 'fbcover.png');
        fs.writeFileSync(filePath, buffer);

        await api.sendMessage(
            {
                body: 'Here is your custom Facebook cover:',
                attachment: fs.createReadStream(filePath)
            },
            event.threadID,
            () => {
                fs.unlinkSync(filePath);
            },
            event.messageID
        );

    } catch (error) {
        console.error('Error creating Facebook cover image:', error);
        api.sendMessage('Failed to generate the Facebook cover. Please try again later.', event.threadID, event.messageID);
    }
};
