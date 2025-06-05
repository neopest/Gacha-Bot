const DataManager = require('../../utils/dataManager');

module.exports = {
    name: 'additemtoinventory',
    description: 'Add an item to a user\'s inventory',
    adminOnly: true,
    execute: (message, args) => {
        if (!message.member.permissions.has('Administrator')) {
            message.channel.send("❌ You do not have permission to use this command.");
            return;
        }

        const targetUserId = args[0]?.replace(/[<@!>]/g, "");
        const itemName = args.slice(1).join(" ");

        if (!targetUserId || !itemName) {
            message.channel.send("❌ Invalid usage. Correct format: `additemtoinventory @User <itemName>`.");
            return;
        }

        const data = DataManager.loadData();
        const itemsData = DataManager.loadItems();

        if (!data.users[targetUserId]) {
            data.users[targetUserId] = { inventory: [], credits: 0 };
        }

        const item = itemsData.items.find((char) => char.name.toLowerCase() === itemName.toLowerCase());

        if (!item) {
            message.channel.send(`❌ Item **${itemName}** is not in the gacha pool.`);
            return;
        }

        data.users[targetUserId].inventory.push({
            name: item.name,
            rarity: item.rarity,
            description: item.description,
        });

        DataManager.saveData(data);

        message.channel.send(`✅ Successfully added **${item.name}** (${item.rarity}) to <@${targetUserId}>'s inventory.`);
    }
};