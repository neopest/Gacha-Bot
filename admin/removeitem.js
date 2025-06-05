const DataManager = require('../../utils/dataManager');

module.exports = {
    name: 'removeitem',
    description: 'Remove an item from a user\'s inventory',
    adminOnly: true,
    execute: (message, args) => {
        if (!message.member.permissions.has('Administrator')) {
            message.channel.send("❌ You do not have permission to use this command.");
            return;
        }

        const targetUserId = args[0]?.replace(/[<@!>]/g, "");
        const itemName = args.slice(1).join(" ");

        if (!targetUserId || !itemName) {
            message.channel.send("❌ Invalid usage. Correct format: `removeitem @User <itemName>`.");
            return;
        }

        const data = DataManager.loadData();

        if (!data.users[targetUserId]) {
            data.users[targetUserId] = { inventory: [], credits: 0 };
        }

        const inventory = data.users[targetUserId].inventory;
        const itemIndex = inventory.findIndex(
            (item) => item.name.toLowerCase() === itemName.toLowerCase()
        );

        if (itemIndex === -1) {
            message.channel.send(`❌ Item **${itemName}** not found in <@${targetUserId}>'s inventory.`);
            return;
        }

        const removedItem = inventory.splice(itemIndex, 1)[0];
        DataManager.saveData(data);

        message.channel.send(`✅ Successfully removed **${removedItem.name}** from <@${targetUserId}>'s inventory.`);
    }
};
