// Define the module configuration
module.exports.config = {
    name: "fbcover",
    version: "1.0.0",
    role: 0,
    credits: "chill",
    description: "Generate a Facebook cover image",
    hasPrefix: false,
    aliases: ["fbcover"],
    usage: "[fbcover <name> | <id> | <subname> | <color>]",
    cooldown: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.run = async function({ api, event, args }) {
    try {
        // Join arguments into a single string and split by " | "
        const input = args.join(" ");
        const [name, id, subname, color] = input.split(" | ");

        // Check if all required arguments are provided
        if (!name || !id || !subname || !color) {
            api.sendMessage("Usage: fbcover <name> | <id> | <subname> | <color>", event.threadID);
            return;
        }

        // Construct the API URL with properly encoded parameters
        const url = `https://hiroshi-rest-api.replit.app/canvas/fbcoverv1?name=${encodeURIComponent(name)}&id=${encodeURIComponent(id)}&subname=${encodeURIComponent(subname)}&color=${encodeURIComponent(color)}`;
        const imagePath = path.join(__dirname, "fbcoverv1.png");

        // Notify the user that the image is being generated
        api.sendMessage("Generating your Facebook cover, please wait...", event.threadID);

        // Fetch the image from the API
        const response = await axios({
            url: url,
            method: 'GET',
            responseType: 'stream'
        });

        // Create a writable stream to save the image
        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);

        // Handle the finish event of the writable stream
        writer.on('finish', async () => {
            try {
                // Send the image as an attachment
                await api.sendMessage({
                    attachment: fs.createReadStream(imagePath)
                }, event.threadID);

                // Clean up the file after sending
                fs.unlinkSync(imagePath);
            } catch (sendError) {
                console.error('Error sending image:', sendError);
                api.sendMessage("An error occurred while sending the image.", event.threadID);
            }
        });

        // Handle errors during the writing process
        writer.on('error', (err) => {
            console.error('Stream writer error:', err);
            api.sendMessage("An error occurred while processing the request.", event.threadID);
        });
    } catch (error) {
        console.error('Error:', error);
        api.sendMessage("An error occurred while processing the request.", event.threadID);
    }
};
