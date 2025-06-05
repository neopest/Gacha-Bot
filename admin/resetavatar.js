const fs = require('fs');
const config = require('../../config/config');

module.exports = {
    name: 'resetavatar',
    description: 'Reset bot avatar to default',
    adminOnly: true,
    execute: async (message) => {
        if (!message.member.permissions.has('Administrator')) {
            message.channel.send("❌ Only admins can change the bot's avatar!");
            return;
        }

        fs.readFile(config.paths.avatarDefault, (err, data) => {
            if (err) {
                console.error("Error reading the local image:", err);
                message.channel.send("❌ Failed to find the local image file.");
                return;
            }

            message.client.user.setAvatar(data)
                .then(() => message.channel.send("✅ Bot avatar reset to default!"))
                .catch(err => {
                    console.error("Error changing avatar:", err);
                    message.channel.send("❌ Failed to change bot avatar.");
                });
        });
    }
};
