const DataManager = require('../../utils/dataManager');

module.exports = {
    name: 'setdescription',
    description: 'Set the description for an item',
    adminOnly: true,
    execute: (message, args) => {
        if (!message.member.permissions.has('Administrator')) {
            message.channel.send("❌ You do not have permission to use this command.");
            return;
        }

        if (args.length < 2) {
            message.channel.send("❌ Invalid usage. Correct format: `setdescription <itemName> <description>`.");
            return;
        }

        const itemName = args[0];
        const description = args.slice(1).join(" ");

        const itemsData = DataManager.loadItems();
        const item = itemsData.items.find((item) => item.name.toLowerCase() === itemName.toLowerCase());

        if (!item) {
            message.channel.send(`❌ Item **${itemName}** not found in the gacha pool.`);
            return;
        }

        item.description = description;
        DataManager.saveItems(itemsData);

        message.channel.send(`✅ Successfully set description for **${item.name}** to: "${description}"`);
    }
};
