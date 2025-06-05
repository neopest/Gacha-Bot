const { EmbedBuilder } = require('discord.js');
const DataManager = require('../../utils/dataManager');
const GachaService = require('../../services/gachaService');
const config = require('../../config/config');

module.exports = {
    name: 'superspin',
    description: 'Super spin for rare or higher items (requires SuperSpin role)',
    execute: async (message) => {
        const data = DataManager.loadData();
        const items = DataManager.loadItems();
        const userId = message.author.id;
        const superSpinRole = message.guild.roles.cache.find(role => role.name === config.roles.superSpin);

        if (!superSpinRole || !message.member.roles.cache.has(superSpinRole.id)) {
            message.channel.send("❌ You need the **SuperSpin** role to use this command!");
            return;
        }

        if (!data.users[userId]) {
            data.users[userId] = { credits: 1, inventory: [] };
        }

        if (data.users[userId].credits < 1) {
            message.channel.send("❌ You need at least 1 Credit to use Super Spin! Earn more Credits and try again.");
            return;
        }

        const pulledCharacter = GachaService.getRareOrHigherCharacter();
        if (!pulledCharacter) {
            message.channel.send("⚠️ No rare or higher items available! Try again later.");
            return;
        }

        const characterIndex = items.items.findIndex(item => item.name === pulledCharacter.name);
        if (characterIndex === -1 || items.items[characterIndex].stock <= 0) {
            message.channel.send(`⚠️ ${pulledCharacter.name} is out of stock! Try again.`);
            return;
        }

        data.users[userId].credits -= 1;
        items.items[characterIndex].stock--;

        data.users[userId].inventory.push({
            name: pulledCharacter.name,
            rarity: pulledCharacter.rarity,
            imageUrl: pulledCharacter.imageUrl,
            description: pulledCharacter.description
        });

        DataManager.saveData(data);
        DataManager.saveItems(items);

        const embed = new EmbedBuilder()
            .setTitle("💎 Super Spin Result!")
            .setDescription(`🎉 **${message.member.displayName}** used **Super Spin** and obtained **${pulledCharacter.name}** (${pulledCharacter.rarity})!`)
            .setColor(0xFFD700)
            .setImage(pulledCharacter.imageUrl)
            .addFields([
                { name: "Item Description", value: `\n*${pulledCharacter.description || "No description available."}*` }
            ])
            .setFooter({
                text: `Remaining Credits: ${data.users[userId].credits}`,
                iconURL: config.emojiUrl
            });

        message.channel.send({ embeds: [embed] });

        const logsChannel = message.guild.channels.cache.get(config.channels.superSpinLogs);
        if (logsChannel) {
            logsChannel.send(`📢 **${message.member.displayName}** used Super Spin and obtained **${pulledCharacter.name}** (${pulledCharacter.rarity}).`);
        }
    }
};
