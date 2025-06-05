const fs = require('fs');
const path = require('path');

class CommandHandler {
    constructor() {
        this.commands = new Map();
        this.blockedUsers = new Set();
        this.loadCommands();
    }

    loadCommands() {
        const commandFolders = ['user', 'admin'];
        
        commandFolders.forEach(folder => {
            const commandsPath = path.join(__dirname, folder);
            if (fs.existsSync(commandsPath)) {
                const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
                
                commandFiles.forEach(file => {
                    const filePath = path.join(commandsPath, file);
                    const command = require(filePath);
                    this.commands.set(command.name, command);
                });
            }
        });
    }

    async handleCommand(message, commandName, args) {
        // Check if user is blocked
        if (this.blockedUsers.has(message.author.id)) {
            message.reply("❌ You are banned from using this bot.");
            return;
        }

        // Check if inventory command is used in guild
        if (commandName === 'inventory' && message.guild) {
            message.reply("❌ You can only use the `inventory` command in DMs.");
            return;
        }

        const command = this.commands.get(commandName);
        if (!command) {
            message.channel.send("Unknown command! Try help for a list of available commands.");
            return;
        }

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(`Error executing command ${commandName}:`, error);
            message.channel.send("❌ An error occurred while executing the command.");
        }
    }

    blockUser(userId) {
        this.blockedUsers.add(userId);
    }

    unblockUser(userId) {
        this.blockedUsers.delete(userId);
    }

    isBlocked(userId) {
        return this.blockedUsers.has(userId);
    }
}

module.exports = CommandHandler;

// =============================================================================
// events/ready.js
// =============================================================================
module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`Bot is online as ${client.user.tag}`);
    },
};
