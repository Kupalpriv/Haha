// Define the module configuration
module.exports.config = {
    name: "avatarv1",
    version: "1.0.0",
    role: 0,
    credits: "chill",
    description: "Generate an avatar image",
    hasPrefix: false,
    aliases: ["avatarv1", "avwibu"],
    usage: "[avatarv1 <id> | <name> | <signature> | <color>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
     
        const input = args.join(" ");
        const [id, name, signature, color] = input.split(" | ");

    
        if (!id || !name || !signature || !color) {
            api.sendMessage("Usage: avatarv1 id-1to800 | name | <signature> | color", event.threadID);
            return;
        }

     
        const url = `https://deku-rest-api-3jvu.onrender.com/canvas/avatarwibu?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}&signature=${encodeURIComponent(signature)}&color=${encodeURIComponent(color)}`;
        const imagePath = path.join(__dirname, "avatarwibu.png");

   
        api.sendMessage("Generating your avatar, please wait...", event.threadID);

     
        const response = await axios({
            url: url,
            method: 'GET',
            responseType: 'stream'
        });

        // Create a writable stream to save the image
        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);

        writer.on('finish', () => {
            api.sendMessage({
                attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => {
                fs.unlinkSync(imagePath); 
            });
        });

  
        writer.on('error', (err) => {
            console.error('Stream writer error:', err);
            api.sendMessage("An error occurred while processing the request.", event.threadID);
        });
    } catch (error) {
        console.error('Error:', error);
        api.sendMessage("An error occurred while processing the request.", event.threadID);
    }
};
