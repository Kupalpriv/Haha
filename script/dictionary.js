const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: 'dictionary',
  version: '1.1.0',
  role: 0,
  aliases: ['define'],
  description: "Fetch a word's definition and audio pronunciation from an API",
  usage: "define [word]",
  credits: 'chilli',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const word = args.join(' ');

  if (!word) {
    return api.sendMessage('Please provide a word to define.', event.threadID, event.messageID);
  }

  const apiUrl = `https://api-nako-choru-production.up.railway.app/voice/word?word=${word}`;

  const indicatorMessageID = await new Promise((resolve, reject) => {
    api.sendMessage('Searching for the word definition...', event.threadID, (err, info) => {
      if (err) return reject(err);
      resolve(info.messageID);
    });
  });

  try {
    const response = await axios.get(apiUrl);
    const { wordData, voiceUrl } = response.data;

    if (!wordData || !wordData.definitions) {
      return api.sendMessage(`No definitions found for the word "${word}".`, event.threadID, event.messageID);
    }

    let definitionsMessage = `Word: "${wordData.word}"\nPart of Speech: ${wordData.partOfSpeech}\n\nDefinitions:\n`;

    wordData.definitions.forEach((entry, index) => {
      definitionsMessage += `Entry ${entry.entryNumber}:\n`;
      entry.senses.forEach((sense, senseIndex) => {
        definitionsMessage += `  ${senseIndex + 1}. ${sense.definition}\n`;
      });
      definitionsMessage += '\n';
    });

    if (wordData.etymology) {
      definitionsMessage += `Etymology: ${wordData.etymology}\n`;
    }
    if (wordData.firstKnownUse) {
      definitionsMessage += `First Known Use: ${wordData.firstKnownUse}\n`;
    }

    const audioResponse = await axios.get(voiceUrl, { responseType: 'arraybuffer' });
    const audioBuffer = Buffer.from(audioResponse.data, 'binary');
    
    const audioPath = path.resolve(__dirname, `${word}.mp3`);
    fs.writeFileSync(audioPath, audioBuffer);

    api.unsendMessage(indicatorMessageID);

    api.sendMessage({
      body: definitionsMessage,
      attachment: fs.createReadStream(audioPath),
    }, event.threadID, () => {
      fs.unlinkSync(audioPath);
    }, event.messageID);

  } catch (error) {
    console.error('Error fetching data:', error);
    api.unsendMessage(indicatorMessageID);
    api.sendMessage('Error fetching the word definition or audio. Please try again later.', event.threadID, event.messageID);
  }
};
