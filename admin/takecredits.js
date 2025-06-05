const DataManager = require('../../utils/dataManager');

module.exports = {
    name: 'takecredits',
    description: 'Remove credits from a user',
    adminOnly: true,
    execute: async (message, args) => {
        if (!message.member.permissions.has('Administrator')) {
            message.channel.send("❌ You do not have permission to use this command.");
            return;
        }

        const targetUserId = args[0]?.replace(/[<@!>]/g, "");
        const creditAmount = parseInt(args[1], 10);

        if (!targetUserId || isNaN(creditAmount) || creditAmount < 0) {
            message.channel.send("❌ Invalid usage. Correct format: `takecredits @User <amount>`.");
            return;
        }

        const targetUser = await message.client.users.fetch(targetUserId);
        if (!targetUser) {
            message.channel.send("❌ User not found.");
            return;
        }

        const data = DataManager.loadData();
        if (!data.users[targetUserId]) {
            data.users[targetUserId] = { credits: 0, inventory: [] };
        }

        if (isNaN(data.users[targetUserId].credits)) {
            data.users[targetUserId].credits = 0;
        }

        const updatedCredits = Math.max(0, data.users[targetUserId].credits - creditAmount);
        data.users[targetUserId].credits = updatedCredits;

        DataManager.saveData(data);

        message.channel.send(`✅ Removed ${creditAmount} Credits from <@${targetUserId}>. New balance: ${updatedCredits}`);
        await targetUser.send(`✅ Your Credits have been decreased by ${creditAmount}. New balance: ${updatedCredits}`);
    }
};
