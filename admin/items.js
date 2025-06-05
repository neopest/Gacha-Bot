const { EmbedBuilder } = require('discord.js');
const DataManager = require('../../utils/dataManager');

module.exports = {
    name: 'additem',
    description: 'Add a new item to the gacha pool',
    adminOnly: true,
    execute: (message, args) => {
        if (!message.member.permissions.has('Administrator')) {
            message.channel.send("❌ You do not have permission to use this command.");
            return;
        }

        const nameEndIndex = args.findIndex(arg => arg.match(/^(Common|Uncommon|Rare|Legendary)$/i));
        if (nameEndIndex === -1 || args.length < nameEndIndex + 2) {
            message.channel.send("❌ Invalid usage. Correct format: `additem <name> <rarity> <stock> [description] [imageUrl]`.");
            return;
        }

        const name = args.slice(0, nameEndIndex).join(" ");
        const rarity = args[nameEndIndex];
        const stock = parseInt(args[nameEndIndex + 1], 10);

        let description = "";
        let imageUrl = null;

        const descriptionStartIndex = nameEndIndex + 2;
        const imageUrlStartIndex = args.findIndex(arg => arg.startsWith('"https://')) || args.length;

        if (imageUrlStartIndex > descriptionStartIndex) {
            description = args.slice(descriptionStartIndex, imageUrlStartIndex).join(" ");
            imageUrl = args[args.length - 1].startsWith('"') && args[args.length - 1].endsWith('"') 
                ? args[args.length - 1].slice(1, -1) 
                : null;
        } else if (imageUrlStartIndex === args.length) {
            description = args.slice(descriptionStartIndex).join(" ");
        }

        if (!name || !rarity || isNaN(stock) || stock <= 0) {
            message.channel.send("❌ Invalid usage. Stock must be a positive number.");
            return;
        }

        const itemsData = DataManager.loadItems();
        itemsData.items.push({
            name,
            rarity,
            stock,
            description: description.trim() || "",
            imageUrl,
        });

        DataManager.saveItems(itemsData);

        message.channel.send(
            `✅ Successfully added **${name}** (${rarity}) with stock ${stock}${
                description.trim() ? `, description: "${description.trim()}"` : ""
            }${imageUrl ? `, and image: ${imageUrl}` : ""} to the pool.`
        );
    }
};
