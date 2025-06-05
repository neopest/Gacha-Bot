module.exports = {
    name: 'block',
    description: 'Block a user from using the bot',
    adminOnly: true,
    execute: (message, args, commandHandler) => {
        if (!message.member.permissions.has('Administrator')) {
            message.channel.send("❌ You do not have permission to use this command.");
            return;
        }

        const targetUserId = args[0]?.replace(/[<@!>]/g, "");

        if (!targetUserId) {
            message.channel.send("❌ Invalid usage. Correct format: `block @User`.");
            return;
        }

        commandHandler.blockUser(targetUserId);
        message.channel.send(`✅ <@${targetUserId}> has been blocked from using the bot.`);
    }
};