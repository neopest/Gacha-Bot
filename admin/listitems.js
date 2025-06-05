const { EmbedBuilder } = require('discord.js');
const DataManager = require('../../utils/dataManager');
const { RARITY_ORDER } = require('../../utils/constants');

module.exports = {
    name: 'items',
    description: 'List all items in the gacha pool',
    adminOnly: true,
    execute: (message) => {
        if (!message.member.permissions.has('Administrator')) {
            message.channel.send("❌ You do not have permission to use this command.");
            return;
        }

        const data = DataManager.loadItems();

        if (!data || !Array.isArray(data.items) || data.items.length === 0) {
            message.channel.send("⚠️ The gacha pool is currently empty.");
            return;
        }

        const sortedCharacters = data.items.sort((a, b) => {
            const rarityComparison = RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
            if (rarityComparison !== 0) return rarityComparison;
            return a.name.localeCompare(b.name);
        });

        const fields = sortedCharacters.map((item) => ({
            name: `${item.name} (${item.rarity})`,
            value: `**Stock:** ${item.stock === 0 ? `❌ ${item.stock}` : item.stock}\n**Description:** ${
                item.description || "No description provided."
            }`,
            inline: false,
        }));

        const gachaEmbed = new EmbedBuilder()
            .setTitle("🎰 Current Gacha Pool")
            .setDescription("Here are the items currently available in the gacha pool:")
            .addFields(fields)
            .setColor(0x00ff00)
            .setFooter({ text: "Manage the gacha pool responsibly!" });

        message.channel.send({ embeds: [gachaEmbed] });
    }
};