const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const DataManager = require('../../utils/dataManager');
const { RARITY_ORDER } = require('../../utils/constants');
const config = require('../../config/config');

module.exports = {
    name: 'showinventory',
    description: 'View a specific player\'s inventory and credits',
    adminOnly: true,
    execute: async (message, args) => {
        if (!message.member.permissions.has('Administrator')) {
            message.channel.send("You do not have permission to use this command.");
            return;
        }

        const mentionedUsers = Array.from(message.mentions.users.values()).filter(user => user.id !== message.client.user.id);

        if (mentionedUsers.length === 0) {
            message.channel.send("Please mention at least one user to check their inventory.");
            return;
        }

        const data = DataManager.loadData();

        const inventoryMessages = mentionedUsers.map(mentionedUser => {
            const userId = mentionedUser.id;
            const inventory = data.users[userId]?.inventory || [];
            const credits = data.users[userId]?.credits || 0;

            if (inventory.length === 0) {
                return `${mentionedUser.displayName}'s inventory is empty! ${config.emoji} Credits: ${credits}`;
            }

            const itemCounts = inventory.reduce((counts, item) => {
                const key = `${item.name} (${item.rarity})`;
                if (!counts[key]) {
                    counts[key] = { count: 0, rarity: item.rarity, name: item.name, description: item.description };
                }
                counts[key].count++;
                return counts;
            }, {});

            const sortedItems = Object.entries(itemCounts)
                .map(([_, data]) => ({
                    itemName: `${data.name} (${data.rarity}) x${data.count}${data.description ? ` - ${data.description}` : ""}`,
                    count: data.count,
                    rarity: data.rarity,
                    name: data.name,
                    description: data.description
                }))
                .sort((a, b) => {
                    const rarityComparison = RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
                    if (rarityComparison !== 0) return rarityComparison;
                    return a.name.localeCompare(b.name);
                });

            const formattedInventory = sortedItems
                .map(({ name, rarity, count, description }) => {
                    return `${name} (${rarity}) x${count}${description ? ` - ${description}` : ""}`;
                })
                .join("\n");

            return `🧳 **Inventory for ${mentionedUser.displayName}:**\n${formattedInventory}\n${config.emoji} Credits: ${credits}`;
        });

        const usersPerPage = 5;
        const pages = [];
        for (let i = 0; i < inventoryMessages.length; i += usersPerPage) {
            pages.push(inventoryMessages.slice(i, i + usersPerPage).join("\n\n"));
        }

        let currentPage = 0;

        const generateEmbed = () => {
            return new EmbedBuilder()
                .setTitle("Admin Inventory Viewer")
                .setDescription(pages[currentPage])
                .setFooter({ text: `Page ${currentPage + 1} of ${pages.length}` })
                .setColor(0x3498db);
        };

        const generateButtons = () => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("prev")
                    .setLabel("◀️ Previous")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("▶️ Next")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === pages.length - 1)
            );
        };

        const messageInstance = await message.channel.send({
            embeds: [generateEmbed()],
            components: [generateButtons()],
        });

        const collector = messageInstance.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000,
        });

        collector.on("collect", async interaction => {
            if (interaction.user.id !== message.author.id) {
                await interaction.reply({ content: "You cannot interact with this menu.", ephemeral: true });
                return;
            }

            if (interaction.customId === "prev" && currentPage > 0) {
                currentPage--;
            } else if (interaction.customId === "next" && currentPage < pages.length - 1) {
                currentPage++;
            }

            await interaction.update({
                embeds: [generateEmbed()],
                components: [generateButtons()],
            });
        });

        collector.on("end", () => {
            const disabledRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("prev")
                    .setLabel("◀️ Previous")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("▶️ Next")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true)
            );

            messageInstance.edit({ components: [disabledRow] });
        });
    }
};
