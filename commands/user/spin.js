const { EmbedBuilder } = require('discord.js');
const DataManager = require('../../utils/dataManager');
const GachaService = require('../../services/gachaService');
const config = require('../../config/config');

module.exports = {
    name: 'spin',
    description: 'Spin the Pokéstop to get a random prize',
    execute: async (message) => {
        if (message.channel.name !== config.channels.pokeball) {
            message.channel.send(`❌ This command can only be used in the #${config.channels.pokeball} channel.`);
            return;
        }

        const data = DataManager.loadData();
        const items = DataManager.loadItems();
        const userId = message.author.id;

        if (!data.users[userId]) {
            data.users[userId] = { credits: 1, inventory: [] };
        }

        if (data.users[userId].credits < 1) {
            message.channel.send("❌ You need at least 1 Credit to spin! Come back later to gain more Credits.");
            return;
        }

        const pulledCharacter = GachaService.getRandomCharacter();
        if (!pulledCharacter) {
            message.channel.send("⚠️ All items have been pulled! No more spins available.");
            return;
        }

        const characterIndex = items.items.findIndex(item => item.name === pulledCharacter.name);
        if (characterIndex === -1 || items.items[characterIndex].stock <= 0) {
            message.channel.send(`⚠️ ${pulledCharacter.name} is out of stock! Try again.`);
            return;
        }

        // Process the spin
        data.users[userId].credits--;
        items.items[characterIndex].stock--;
        
        data.users[userId].inventory.push({
            name: pulledCharacter.name,
            rarity: pulledCharacter.rarity,
            imageUrl: pulledCharacter.imageUrl,
            description: pulledCharacter.description
        });

        DataManager.saveData(data);
        DataManager.saveItems(items);

        // Send result
        const embed = new EmbedBuilder()
            .setTitle("🎉 Pokéstop Spin Result!")
            .setDescription(`You spun the Pokéstop and found **${pulledCharacter.name}** (${pulledCharacter.rarity})!`)
            .setColor(0x00FF00)
            .setImage(pulledCharacter.imageUrl)
            .addFields([
                { name: "Item Description", value: `\n*${pulledCharacter.description || "No description available."}*` }
            ])
            .setFooter({
                text: `Remaining Credits: ${data.users[userId].credits}`,
                iconURL: config.emojiUrl
            });

        message.author.send({ embeds: [embed] })
            .catch(err => {
                console.error("Could not send DM to user:", err);
                message.channel.send("❌ I couldn't DM you the result. Please check your DM settings.");
            });

        // Log the spin
        const logMessage = `${message.member.displayName} spun the Pokéstop and got **${pulledCharacter.name}** (${pulledCharacter.rarity}).`;
        const logsChannel = message.guild.channels.cache.get(config.channels.logs);

        if (logsChannel) {
            logsChannel.send(logMessage);
        } else {
            console.error(`Logs channel with ID ${config.channels.logs} not found.`);
        }

        message.channel.send(`${message.member.displayName} spun the Pokéstop!`);
    }
};
