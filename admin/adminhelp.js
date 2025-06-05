const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'adminhelp',
    description: 'Display admin help information',
    adminOnly: true,
    execute: (message) => {
        if (!message.member.permissions.has('Administrator')) {
            message.channel.send("❌ You do not have permission to use this command.");
            return;
        }

        const helpEmbed = new EmbedBuilder()
            .setTitle("📜 Admin Bot Commands")
            .setDescription(`
- \`addcredits @User <amount>\`: Add credits to a user.
- \`takecredits @User <amount>\`: Remove credits from a user.
- \`setcredits @User <amount>\`: Set a user's credits to a specific amount.
- \`addcreditsall\`: Add 1 credit to all server members.
- \`memberinfo\`: View all members' inventories and credits.
- \`deadinfo\`: View all dead players' inventories and credits.
- \`showinventory @User\`: View a specific player's inventory and credits.
- \`additem <name> <rarity> <stock>\`: Add a new item to the Pokéstop.
- \`setdescription <itemName> <description>\`: Set the description for an item.
- \`removeitem @User <itemName>\`: Remove an item from a user's inventory.
- \`removegachaitem <itemName>\`: Remove an item from the gacha pool.
- \`items\`: See a list of all items currently in the gacha pool.
- \`additemtoinventory @User <itemName>\`: Add an item to a user's inventory.
- \`modifyitem <itemname> <property> <newvalue>\`: Change the properties of an item in the pool.
- \`block @User\`: Block a user from being able to use the bot.
- \`unblock @User\`: Unblock a user and allow them to use the bot.
- \`addteam <valor/instinct> @User1 @User2...\`: Add users to teams.
- \`avatar\`: Change bot avatar to rocket theme.
- \`resetavatar\`: Reset bot avatar to default.
- \`nickname <name>\`: Change bot nickname.
            `)
            .setColor(0x7289da)
            .setFooter({ text: "Use these commands responsibly." });

        message.channel.send({ embeds: [helpEmbed] });
    }
};
