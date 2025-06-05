const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config/config');
const CommandHandler = require('./commands/commandHandler');

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
    ],
});

// Initialize command handler
const commandHandler = new CommandHandler();

// Load event handlers
const fs = require('fs');
const path = require('path');

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args, commandHandler));
    }
}

// Login to Discord with your bot token
client.login(config.token);