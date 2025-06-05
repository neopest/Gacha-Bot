const DataManager = require('../../utils/dataManager');

module.exports = {
    name: 'removegachaitem',
    description: 'Remove an item from the gacha pool',
    adminOnly: true,
    execute: (message, args) => {
        if (!message.member.permissions.has('Administrator')) {
            message.channel.send("❌ You do not have permission to use this command.");
            return;
        }

        const itemName = args.join(" ");

        if (!itemName) {
            message.channel.send("❌ Invalid usage. Correct format: `removegachaitem <itemName>`.");
            return;
        }

        const items = DataManager.loadItems();
        const itemIndex = items.items.findIndex(
            (item) => item.name.toLowerCase() === itemName.toLowerCase()
        );

        if (itemIndex === -1) {
            message.channel.send(`❌ Item **${itemName}** not found in the gacha pool.`);
            return;
        }

        const removedItem = items.items.splice(itemIndex, 1)[0];
        DataManager.saveItems(items);

        message.channel.send(`✅ Successfully removed **${removedItem.name}** from the gacha pool.`);
    }
};
