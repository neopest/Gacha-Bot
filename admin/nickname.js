module.exports = {
    name: 'nickname',
    description: 'Change bot nickname',
    adminOnly: true,
    execute: async (message, args) => {
        if (!message.member.permissions.has('Administrator')) {
            message.channel.send("❌ Only admins can change the bot's nickname!");
            return;
        }

        const newNickname = args.join(" ");
        if (!newNickname.trim()) {
            message.channel.send("❌ Please provide a nickname.");
            return;
        }

        try {
            await message.guild.members.me.setNickname(newNickname);
            message.channel.send(`✅ Bot's nickname has been updated to: ${newNickname}`);
        } catch (err) {
            console.error("Error changing bot nickname:", err);
            message.channel.send("❌ Failed to change bot nickname.");
        }
    }
};
