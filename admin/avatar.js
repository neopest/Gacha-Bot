const fs = require('fs');
const config = require('../../config/config');

module.exports = {
    name: 'avatar',
    description: 'Change bot avatar to rocket theme',
    adminOnly: true,
    execute: async (message) => {
        if (!message.member.permissions.has('Administrator')) {
            message.channel.send("❌ Only admins can change the bot's avatar!");
            return;
        }

        fs.readFile(config.paths.avatarRocket, (err, data) => {
            if (err) {
                console.error("Error reading the local image:", err);
                message.channel.send("❌ Failed to find the local image file.");
                return;
            }

            message.client.user.setAvatar(data)
                .then(() => message.channel.send("✅ Bot avatar updated to the rocket image!"))
                .catch(err => {
                    console.error("Error changing avatar:", err);
                    message.channel.send("❌ Failed to change bot avatar.");
                });
        });
    }
};
