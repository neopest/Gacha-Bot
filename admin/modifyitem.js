const DataManager = require('../../utils/dataManager');

module.exports = {
    name: 'modifyitem',
    description: 'Modify an item in the gacha pool',
    adminOnly: true,
    execute: (message, args) => {
        if (!message.member.permissions.has('Administrator')) {
            message.channel.send("❌ You do not have permission to use this command.");
            return;
        }

        const propertyIndex = args.findIndex(arg => ["rarity", "stock", "description", "image"].includes(arg.toLowerCase()));

        if (propertyIndex === -1 || propertyIndex === args.length - 1) {
            message.channel.send("❌ Invalid usage. Correct format: modifyitem <itemName> <property> <newValue>.");
            return;
        }

        const itemName = args.slice(0, propertyIndex).join(" ");
        const propertyToChange = args[propertyIndex].toLowerCase();
        const newValue = args.slice(propertyIndex + 1).join(" ");

        if (!itemName || !propertyToChange || !newValue) {
            message.channel.send("❌ Invalid usage. Correct format: modifyitem <itemName> <property> <newValue>.");
            return;
        }

        const itemsData = DataManager.loadItems();
        const item = itemsData.items.find((char) => char.name.toLowerCase() === itemName.toLowerCase());

        if (!item) {
            message.channel.send(`❌ Item **${itemName}** not found in the gacha pool.`);
            return;
        }

        if (propertyToChange === "rarity" && ["common", "uncommon", "rare", "legendary"].includes(newValue.toLowerCase())) {
            item.rarity = newValue.charAt(0).toUpperCase() + newValue.slice(1).toLowerCase();
        } else if (propertyToChange === "stock" && !isNaN(parseInt(newValue)) && parseInt(newValue) >= 0) {
            item.stock = parseInt(newValue);
        } else if (propertyToChange === "description") {
            item.description = newValue;
        } else if (propertyToChange === "image") {
            if (newValue.startsWith('"') && newValue.endsWith('"')) {
                item.imageUrl = newValue.slice(1, -1);
            } else {
                message.channel.send("❌ Invalid image URL format. It must be wrapped in quotes.");
                return;
            }
        } else {
            message.channel.send("❌ Invalid property or value.");
            return;
        }

        DataManager.saveItems(itemsData);
        message.channel.send(`✅ Successfully updated **${item.name}**'s ${propertyToChange} to **${newValue}**.`);
    }
};
