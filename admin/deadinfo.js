const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const DataManager = require('../../utils/dataManager');
const { RARITY_ORDER } = require('../../utils/constants');
const config = require('../../config/config');

module.exports = {
    name: 'deadinfo',
    description: 'View all dead players\' inventories and credits',
    adminOnly: true,
    execute: async (message) => {
        if (!message.member.permissions.has('Administrator')) {
            message.channel.send("❌ You do not have permission to use this command.");
            return;
        }

        try {
            const data = DataManager.loadData();
            const members = await message.guild.members.fetch();

            const deadMembers = members.filter((member) =>
                member.roles.cache.some(role => role.name === config.roles.dead) &&
                !member.user.bot
            );

            if (deadMembers.size === 0) {
                message.channel.send("❌ No members with the 'Dead' role found in the server.");
                return;
            }

            const memberInfo = deadMembers.map((member) => {
                const userId = member.user.id;
                const inventory = data.users[userId]?.inventory || [];
                const credits = data.users[userId]?.credits || 0;

                const stackedInventory = inventory.reduce((acc, item) => {
                    const existing = acc.find((entry) => entry.name === item.name);
                    if (existing) {
                        existing.count++;
                    } else {
                        acc.push({ name: item.name, rarity: item.rarity, count: 1 });
                    }
                    return acc;
                }, []);

                const sortedInventory = stackedInventory.sort((a, b) => {
                    const rarityComparison = RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
                    if (rarityComparison !== 0) return rarityComparison;
                    return a.name.localeCompare(b.name);
                });

                const formattedInventory = sortedInventory
                    .map((entry) => `${entry.name} (${entry.rarity}) x${entry.count}`)
                    .join(", ") || "None";

                return `👤 **${member.displayName}**\n🧳 Inventory: ${formattedInventory}\n${config.emoji} Credits: ${credits}`;
            });

            const pageSize = 5;
            const totalPages = Math.ceil(memberInfo.length / pageSize);
            const pages = [];

            for (let i = 0; i < totalPages; i++) {
                const pageContent = memberInfo.slice(i * pageSize, (i + 1) * pageSize).join("\n\n");
                pages.push(pageContent);
            }

            let currentPage = 0;
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle(`Dead Member Info (Page 1/${totalPages})`)
                .setDescription(pages[currentPage]);

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('◀️ Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('▶️ Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === totalPages - 1)
                );

            const msg = await message.channel.send({
                embeds: [embed],
                components: [row],
            });

            const filter = (interaction) => interaction.user.id === message.author.id;
            const collector = msg.createMessageComponentCollector({
                filter,
                time: 60000,
            });

            collector.on('collect', async (interaction) => {
                try {
                    if (interaction.customId === 'next' && currentPage < totalPages - 1) {
                        currentPage++;
                    } else if (interaction.customId === 'previous' && currentPage > 0) {
                        currentPage--;
                    }

                    embed.setDescription(pages[currentPage])
                        .setTitle(`Dead Member Info (Page ${currentPage + 1}/${totalPages})`);

                    row.components[0].setDisabled(currentPage === 0);
                    row.components[1].setDisabled(currentPage === totalPages - 1);

                    await interaction.update({
                        embeds: [embed],
                        components: [row],
                    });
                } catch (error) {
                    console.error("Error updating interaction:", error);
                }
            });

            collector.on('end', () => {
                row.components.forEach((button) => button.setDisabled(true));
                msg.edit({ components: [row] });
            });
        } catch (error) {
            console.error("Error fetching dead member info:", error);
            message.channel.send("❌ An error occurred while fetching dead member information.");
        }
    }
};
