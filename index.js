const fs = require('fs');
const path = require('path');
const login = require('./fb-chat-api/index');
const express = require('express');
const app = express();
const chalk = require('chalk');
const bodyParser = require('body-parser');
const axios = require('axios');
const moment = require("moment-timezone");
const cron = require('node-cron');

// Config creation fallback if not present
const config = fs.existsSync('./data/config.json') ? JSON.parse(fs.readFileSync('./data/config.json', 'utf8')) : createConfig();

// Utility object to store various collections
const Utils = {
    commands: new Map(),
    handleEvent: new Map(),
    account: new Map(),
    cooldowns: new Map()
};

// Load and install scripts from 'script' folder
const script = path.join(__dirname, 'script');
fs.readdirSync(script).forEach((file) => {
    const scripts = path.join(script, file);
    const stats = fs.statSync(scripts);
    
    if (stats.isDirectory()) {
        fs.readdirSync(scripts).forEach(subfile => installCommand(path.join(scripts, subfile)));
    } else {
        installCommand(scripts);
    }
});

// Function to load and install a command script
function installCommand(filepath) {
    try {
        const { config, run, handleEvent } = require(filepath);
        if (config) {
            const { name = [], role = '0', version = '1.0.0', hasPrefix = true, aliases = [], description = '', usage = '', credits = '', cooldown = '5' } = config;
            aliases.push(name);
            
            if (run) {
                Utils.commands.set(aliases, { name, role, run, aliases, description, usage, version, hasPrefix, credits, cooldown });
            }
            if (handleEvent) {
                Utils.handleEvent.set(aliases, { name, handleEvent, role, description, usage, version, hasPrefix, credits, cooldown });
            }
        }
    } catch (error) {
        console.error(chalk.red(`Error installing command from file ${path.basename(filepath)}: ${error.message}`));
    }
}

// Express setup
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(express.json());

// Routes setup
const routes = [
    { path: '/', file: 'index.html' },
    { path: '/step_by_step_guide', file: 'guide.html' },
    { path: '/online_user', file: 'online.html' },
    { path: '/contact', file: 'contact.html' },
    { path: '/random_shoti', file: 'shoti.html' },
    { path: '/analog', file: 'analog.html' },
    { path: '/clock', file: 'clock.html' },
    { path: '/time', file: 'crazy.html' },
    { path: '/developer', file: 'developer.html' },
    { path: '/random', file: 'random.html' },
    { path: '/spotify', file: 'spotify.html' }
];

routes.forEach(route => {
    app.get(route.path, (req, res) => res.sendFile(path.join(__dirname, 'public', route.file)));
});

// Info route
app.get('/info', (req, res) => {
    const data = Array.from(Utils.account.values()).map(account => ({
        name: account.name,
        profileUrl: account.profileUrl,
        thumbSrc: account.thumbSrc,
        time: account.time
    }));
    res.json(data);
});

// Commands route
app.get('/commands', (req, res) => {
    const commandSet = new Set();
    const commands = [...Utils.commands.values()].map(({ name }) => (commandSet.add(name), name));
    const handleEvent = [...Utils.handleEvent.values()].map(({ name }) => commandSet.has(name) ? null : (commandSet.add(name), name)).filter(Boolean);
    const role = [...Utils.commands.values()].map(({ role }) => role);
    const aliases = [...Utils.commands.values()].map(({ aliases }) => aliases);

    res.json({ commands, handleEvent, role, aliases });
});

// Login route
app.post('/login', async (req, res) => {
    const { state, commands, prefix, admin } = req.body;
    if (!state) {
        return res.status(400).json({ error: true, message: 'Missing app state data' });
    }

    const cUser = state.find(item => item.key === 'c_user');
    if (!cUser) {
        return res.status(400).json({ error: true, message: 'Invalid appstate data' });
    }

    const existingUser = Utils.account.get(cUser.value);
    if (existingUser) {
        return res.status(400).json({ error: false, message: "User already logged in", user: existingUser });
    }

    try {
        await accountLogin(state, commands, prefix, admin);
        res.status(200).json({ success: true, message: 'Logged in successfully' });
    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});

// Error handling for unhandled rejections
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Promise Rejection:', reason);
});

// Function to log in an account using app state
async function accountLogin(state, enableCommands = [], prefix, admin = []) {
    return new Promise((resolve, reject) => {
        login({ appState: state }, async (error, api) => {
            if (error) {
                return reject(error);
            }

            const userid = await api.getCurrentUserID();
            await addThisUser(userid, enableCommands, state, prefix, admin);

            const userInfo = await api.getUserInfo(userid);
            if (!userInfo || !userInfo[userid]?.name) {
                return reject(new Error('Failed to retrieve user info'));
            }

            const { name, profileUrl, thumbSrc } = userInfo[userid];
            Utils.account.set(userid, { name, profileUrl, thumbSrc, time: 0 });

            resolve();
        });
    });
}

// Add user function
async function addThisUser(userid, enableCommands, state, prefix, admin, blacklist = []) {
    const configFile = './data/history.json';
    const sessionFolder = './data/session';
    const sessionFile = path.join(sessionFolder, `${userid}.json`);

    if (fs.existsSync(sessionFile)) return;

    const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    config.push({ userid, prefix: prefix || "", admin: admin || [], blacklist: blacklist || [], enableCommands, time: 0 });
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    fs.writeFileSync(sessionFile, JSON.stringify(state));
}

// Aliases function
function aliases(command) {
    const aliasEntry = Array.from(Utils.commands.entries()).find(([commands]) => commands.includes(command?.toLowerCase()));
    return aliasEntry ? aliasEntry[1] : null;
}

// Main entry point
async function main() {
    const empty = require('fs-extra');
    const cacheFile = './script/cache';
    
    if (!fs.existsSync(cacheFile)) fs.mkdirSync(cacheFile);
    const configFile = './data/history.json';
    if (!fs.existsSync(configFile)) fs.writeFileSync(configFile, '[]', 'utf-8');
    
    const sessionFolder = path.join('./data/session');
    if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder);

    const adminOfConfig = JSON.parse(fs.readFileSync('./data/config.json', 'utf8'));
    cron.schedule(`*/${adminOfConfig[0].masterKey.restartTime} * * * *`, async () => {
        const history = JSON.parse(fs.readFileSync('./data/history.json', 'utf-8'));
        history.forEach(user => {
            if (!user || typeof user !== 'object' || isNaN(user.time)) process.exit(1);
            const update = Utils.account.get(user.userid);
            if (update) user.time = update.time;
        });
        await empty.emptyDir(cacheFile);
        await fs.writeFileSync('./data/history.json', JSON.stringify(history, null, 2));
        process.exit(1);
    });

    // Load sessions and login users
    try {
        for (const file of fs.readdirSync(sessionFolder)) {
            const filePath = path.join(sessionFolder, file);
            try {
                const { enableCommands, prefix, admin, blacklist } = JSON.parse(fs.readFileSync(configFile, 'utf8')).find(item => item.userid === path.parse(file).name) || {};
                const state = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                if (enableCommands) await accountLogin(state, enableCommands, prefix, admin, blacklist);
            } catch (error) {
                deleteThisUser(path.parse(file).name);
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// Function to create initial config
function createConfig() {
    const config = [{
        masterKey: { admin: [], devMode: false, database: false, restartTime: 210 },
        fcaOption: {
            forceLogin: true, listenEvents: true, logLevel: "silent",
            updatePresence: true, selfListen: false, online: true,
            autoMarkDelivery: false, autoMarkRead: false
        }
    }];
    const dataFolder = './data';
    if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder);
    fs.writeFileSync('./data/config.json', JSON.stringify(config, null, 2));
    return config;
}

// Starting the app
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

// Run the main function

main();
