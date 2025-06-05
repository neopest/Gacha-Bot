const DataManager = require('../utils/dataManager');
const config = require('../config/config');

module.exports = {
    name: 'messageCreate',
    execute: async (message, commandHandler) => {
        // Ignore messages from bots
        if (message.author.bot) return;

        // Ignore replies
        if (message.type === "REPLY") return;

        // Initialize user data if not present
        DataManager.initializeUser(message.author.id);

        // Check if the message is from a guild (not a DM)
        const isDM = message.guild === null;

        // Check if the bot is mentioned in the message
        const botRoleMention = `<@&${message.guild?.roles.cache.find(r => r.name === config.roles.pokestop)?.id}>`;
        const botMentionRegex = new RegExp(`<@!?${message.client.user.id}>|${botRoleMention}`, "g");

        // Handle DMs
        if (isDM) {
            if (!message.content.match(botMentionRegex)) {
                message.reply("You need to mention the bot to use commands in DMs!");
                return;
            }

            const contentWithoutMention = message.content.replace(botMentionRegex, "").trim();
            const args = contentWithoutMention.split(" ");
            const command = args[0]?.toLowerCase();

            await commandHandler.handleCommand(message, command, args.slice(1));
            return;
        }

        // Handle guild messages
        if (message.content.match(botMentionRegex)) {
            const contentWithoutMention = message.content.replace(botMentionRegex, "").trim();
            const args = contentWithoutMention.split(" ");
            const command = args[0]?.toLowerCase();

            await commandHandler.handleCommand(message, command, args.slice(1));
        }
    },
};

// =============================================================================
// index.js (Main bot file)
// =============================================================================
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
