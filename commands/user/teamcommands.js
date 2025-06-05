const { addTag, removeTag, hasTag } = require('../admin/teams');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const DataManager = require('../../utils/dataManager');
const { RARITY_ORDER } = require('../../utils/constants');
const config = require('../../config/config');

module.exports = [
    {
        name: 'addvalor',
        description: 'Add Valor tag to mentioned user',
        execute: (message) => {
            const mentionedUser = message.mentions.users.find((user) => user.id !== message.client.user.id);
            const userId = mentionedUser ? mentionedUser.id : message.author.id;
            addTag(userId, "valor");
            message.channel.send(`<@${userId}> has been tagged as **Valor**.`);
        }
    },
    {
        name: 'addinstinct',
        description: 'Add Instinct tag to mentioned user',
        execute: (message) => {
            const mentionedUser = message.mentions.users.find((user) => user.id !== message.client.user.id);
            const userId = mentionedUser ? mentionedUser.id : message.author.id;
            addTag(userId, "instinct");
            message.channel.send(`<@${userId}> has been tagged as **Instinct**.`);
        }
    },
    {
        name: 'removevalor',
        description: 'Remove Valor tag from mentioned user',
        execute: (message) => {
            const mentionedUser = message.mentions.users.find((user) => user.id !== message.client.user.id);
            const userId = mentionedUser ? mentionedUser.id : message.author.id;
            removeTag(userId, "valor");
            message.channel.send(`<@${userId}> is no longer tagged as **Valor**.`);
        }
    },
    {
        name: 'removeinstinct',
        description: 'Remove Instinct tag from mentioned user',
        execute: (message) => {
            const mentionedUser = message.mentions.users.find((user) => user.id !== message.client.user.id);
            const userId = mentionedUser ? mentionedUser.id : message.author.id;
            removeTag(userId, "instinct");
            message.channel.send(`<@${userId}> is no longer tagged as **Instinct**.`);
        }
    },
    {
        name: 'valorinventory',
        description: 'Show Valor team inventory',
        execute: async (message) => {
            await showTaggedInventory(message, "valor");
        }
    },
    {
        name: 'instinctinventory',
        description: 'Show Instinct team inventory',
        execute: async (message) => {
            await showTaggedInventory(message, "instinct");
        }
    }
];

async function showTaggedInventory(message, tag) {
    const allowedChannelName = config.channels.inventory;
    if (message.channel.name !== allowedChannelName) {
        message.channel.send(`❌ This command can only be used in the #${allowedChannelName} channel.`);
        return;
    }

    const data = DataManager.loadData();
    const isAdmin = message.member.permissions.has("Administrator");
    const userHasTag = hasTag(message.author.id, tag);

    if (!isAdmin && !userHasTag) {
        message.channel.send(`❌ You do not have permission to view the ${tag} inventory.`);
        return;
    }

    const usersWithTag = Object.keys(data.users).filter(userId => hasTag(userId, tag));
    if (usersWithTag.length === 0) {
        message.channel.send(`⚠️ No users with the ${tag} tag found.`);
        return;
    }

    const inventoryMessages = await Promise.all(usersWithTag.map(async userId => {
        const userInventory = data.users[userId]?.inventory || [];
        const credits = data.users[userId]?.credits || 0;

        const member = message.guild.members.cache.get(userId);
        const displayName = member ? member.displayName : `Unknown User (${userId})`;

        if (userInventory.length === 0) {
            return { name: displayName, inventory: "🛑 No items in inventory.", credits };
        }

        const itemCounts = userInventory.reduce((counts, item) => {
            const key = `${item.name} (${item.rarity})`;
            if (!counts[key]) counts[key] = { count: 0, rarity: item.rarity, name: item.name };
            counts[key].count++;
            return counts;
        }, {});

        const sortedItems = Object.values(itemCounts)
            .sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity))
            .map(data => `• **${data.name}** (${data.rarity}) × ${data.count}`);

        return { name: displayName, inventory: sortedItems.join("\n"), credits };
    }));

    const itemsPerPage = 3; 
    const pages = [];
    for (let i = 0; i < inventoryMessages.length; i += itemsPerPage) {
        pages.push(inventoryMessages.slice(i, i + itemsPerPage));
    }

    let currentPage = 0;
    const tagColor = tag === "valor" ? 0xFF0000 : tag === "instinct" ? 0xFFD700 : 0x0099FF;

    const generateEmbed = () => {
        const embed = new EmbedBuilder()
            .setTitle(`📜 ${tag.charAt(0).toUpperCase() + tag.slice(1)} Inventory Viewer`)
            .setColor(tagColor)
            .setFooter({ text: `Page ${currentPage + 1} of ${pages.length}` });

        pages[currentPage].forEach(user => {
            embed.addFields(
                { name: `👤 ${user.name}`, value: `${config.emoji} **Credits:** ${user.credits}\n${user.inventory}`, inline: false }
            );
        });

        return embed;
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
            await interaction.reply({ content: "❌ You cannot interact with this menu.", ephemeral: true });
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
            new ButtonBuilder().setCustomId("prev").setLabel("◀️ Previous").setStyle(ButtonStyle.Primary).setDisabled(true),
            new ButtonBuilder().setCustomId("next").setLabel("▶️ Next").setStyle(ButtonStyle.Primary).setDisabled(true)
        );
        messageInstance.edit({ components: [disabledRow] });
    });
}
