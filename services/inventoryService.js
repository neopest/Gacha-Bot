const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const DataManager = require('../utils/dataManager');
const { RARITY_ORDER } = require('../utils/constants');
const config = require('../config/config');

class InventoryService {
    static async showInventory(message) {
        const userId = message.author.id;
        const data = DataManager.loadData();
        
        if (!data.users[userId]) {
            data.users[userId] = { credits: 0, inventory: [] };
            DataManager.saveData(data);
        }

        const inventory = data.users[userId].inventory || [];
        const credits = data.users[userId].credits || 0;

        if (inventory.length === 0) {
            try {
                await message.author.send(`Your inventory is empty! Try spinning with \`spin\`. ${config.emoji} Credits: ${credits}`);
            } catch (error) {
                console.error("Error sending DM to user:", error);
                message.channel.send("❌ I couldn't send you a DM. Please ensure your DMs are open.");
            }
            return;
        }

        const pages = this._createInventoryPages(inventory, credits);
        await this._sendPaginatedInventory(message, pages, credits);
    }

    static _createInventoryPages(inventory, credits) {
        const itemCounts = this._groupInventoryItems(inventory);
        const sortedItems = this._sortInventoryItems(itemCounts);
        
        const itemsPerPage = 10;
        const pages = [];
        
        for (let i = 0; i < sortedItems.length; i += itemsPerPage) {
            const pageItems = sortedItems.slice(i, i + itemsPerPage)
                .map(({ itemName }) => itemName)
                .join("\n");
            pages.push(pageItems);
        }
        
        return pages;
    }

    static _groupInventoryItems(inventory) {
        return inventory.reduce((counts, item) => {
            const key = `${item.name} (${item.rarity})`;
            if (!counts[key]) {
                counts[key] = { count: 0, rarity: item.rarity, name: item.name, description: item.description };
            }
            counts[key].count++;
            return counts;
        }, {});
    }

    static _sortInventoryItems(itemCounts) {
        return Object.entries(itemCounts)
            .map(([_, data]) => ({
                itemName: `${data.name} (${data.rarity}) x${data.count}${data.description ? ` - ${data.description}` : ""}`,
                count: data.count,
                rarity: data.rarity,
                name: data.name,
                description: data.description,
            }))
            .sort((a, b) => {
                const rarityComparison = RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
                if (rarityComparison !== 0) return rarityComparison;
                return a.name.localeCompare(b.name);
            });
    }

    static async _sendPaginatedInventory(message, pages, credits) {
        let currentPage = 0;
        const userId = message.author.id;

        const generateEmbed = () => {
            return new EmbedBuilder()
                .setTitle("🧳 Your Inventory")
                .setDescription(pages[currentPage])
                .setColor(0x3498db)
                .setFooter({
                    text: `Credits: ${credits} | Page ${currentPage + 1} of ${pages.length}`,
                    iconURL: config.emojiUrl
                });
        };

        const generateButtons = () => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('◀️ Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('▶️ Next')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === pages.length - 1)
            );
        };

        try {
            const messageInstance = await message.author.send({
                embeds: [generateEmbed()],
                components: [generateButtons()],
            });

            const collector = messageInstance.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 60000,
            });

            collector.on('collect', async (interaction) => {
                if (interaction.user.id !== userId) {
                    await interaction.reply({ content: "This isn't your inventory!", ephemeral: true });
                    return;
                }

                if (interaction.customId === 'prev' && currentPage > 0) {
                    currentPage--;
                } else if (interaction.customId === 'next' && currentPage < pages.length - 1) {
                    currentPage++;
                }

                await interaction.update({
                    embeds: [generateEmbed()],
                    components: [generateButtons()],
                });
            });

            collector.on('end', () => {
                const disabledRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('prev').setLabel('◀️ Previous').setStyle(ButtonStyle.Primary).setDisabled(true),
                    new ButtonBuilder().setCustomId('next').setLabel('▶️ Next').setStyle(ButtonStyle.Primary).setDisabled(true)
                );
                messageInstance.edit({ components: [disabledRow] });
            });

        } catch (error) {
            console.error("Error sending inventory DM:", error);
            message.channel.send("❌ I couldn't send you your inventory in DM. Please make sure your DMs are open.");
        }
    }
}

module.exports = InventoryService;

// =============================================================================
// commands/user/spin.js
// =============================================================================
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
