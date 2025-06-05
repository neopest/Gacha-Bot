module.exports = {
    name: 'unblock',
    description: 'Unblock a user from using the bot',
    adminOnly: true,
    execute: (message, args, commandHandler) => {
        if (!message.member.permissions.has('Administrator')) {
            message.channel.send("❌ You do not have permission to use this command.");
            return;
        }

        const targetUserId = args[0]?.replace(/[<@!>]/g, "");

        if (!targetUserId) {
            message.channel.send("❌ Invalid usage. Correct format: `unblock @User`.");
            return;
        }

        if (!commandHandler.isBlocked(targetUserId)) {
            message.channel.send(`❌ User <@${targetUserId}> is not blocked.`);
            return;
        }

        commandHandler.unblockUser(targetUserId);
        message.channel.send(`✅ Successfully unblocked <@${targetUserId}>.`);
    }
};
