const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Display help information',
    execute: (message) => {
        const helpEmbed = new EmbedBuilder()
            .setTitle("🤖 Bot Commands")
            .setDescription(`
- \`spin\`: Spin the Pokéstop to get a random prize. Costs 1 Credit. Only usable in the spin channel.
- \`inventory\`: View your collected prizes and Credits. Only usable in private messages.
- \`help\`: Display this help message.
            `)
            .setColor(0x00bfff)
            .setFooter({ text: "🎉 You earn 1 Credit every SOD!" });

        message.channel.send({ embeds: [helpEmbed] });
    }
};
