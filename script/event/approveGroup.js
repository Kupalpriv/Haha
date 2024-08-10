const cron = require('node-cron');

module.exports.config = {
  name: "approveThread",
  version: "69.69",
  credits: "cliff",
  description: "Approve group threads automatically"
};

module.exports.handleEvent = async ({ api }) => {
  const minInterval = 5;
  let lastMessageTime = 0;
  let messagedThreads = new Set();

  const configCustom = {
    acceptPending: {
      status: true,
      time: 2, 
      message: "Hello, I'm your bot. I'm here to help you.",
      note: 'Approve waiting messages after a certain time. Set the status to false to disable auto-accept message requests.'
    }
  };

  function acceptPending(config) {
    if (config.status) {
      cron.schedule(`*/${config.time} * * * *`, async () => {
        const pendingThreads = await api.getThreadList(1, null, ['PENDING']);
        const otherThreads = await api.getThreadList(1, null, ['OTHER']);
        const allThreads = [...pendingThreads, ...otherThreads];

        if (allThreads.length > 0) {
          const threadID = allThreads[0].threadID;
          api.sendMessage('This Thread/User is automatically approved by Our System\n\nDon`t try to spam my bot to avoid being blocked🖕', threadID);
        }
      });
    }
  }  acceptPending(configCustom.acceptPending);
};
