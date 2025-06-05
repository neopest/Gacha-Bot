const DataManager = require('../../utils/dataManager');

module.exports = {
    name: 'addcreditsall',
    description: 'Add credits to all server members',
    adminOnly: true,
    execute: async (message) => {
        if (!message.member.permissions.has('Administrator')) {
            message.channel.send("❌ You do not have permission to use this command.");
            return;
        }

        const data = DataManager.loadData();
        let updatedUsers = [];

        try {
            const members = await message.guild.members.fetch();

            members.forEach(member => {
                const userId = member.user.id;
                if (!data.users) data.users = {};
                if (!data.users[userId]) {
                    data.users[userId] = { credits: 0, inventory: [] };
                }

                if (isNaN(data.users[userId].credits)) {
                    data.users[userId].credits = 0;
                }

                data.users[userId].credits += 1;
                updatedUsers.push(`<@${userId}>`);
            });

            DataManager.saveData(data);

            if (updatedUsers.length > 0) {
                message.channel.send(`✅ Added 1 Credit to the following users: ${updatedUsers.join(", ")}`);
            } else {
                message.channel.send("❌ No users found to receive credits.");
            }

        } catch (error) {
            console.error("Error fetching members:", error);
            message.channel.send("❌ Failed to fetch members.");
        }
    }
};
