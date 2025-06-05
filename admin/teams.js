const DataManager = require('../../utils/dataManager');

// Team management system
const userTags = {};

function addTag(userId, tag) {
    if (!userTags[userId]) userTags[userId] = new Set();
    userTags[userId].add(tag);
}

function removeTag(userId, tag) {
    if (userTags[userId]) userTags[userId].delete(tag);
}

function hasTag(userId, tag) {
    return userTags[userId] && userTags[userId].has(tag);
}

module.exports = {
    name: 'addteam',
    description: 'Add users to teams',
    adminOnly: true,
    execute: (message, args) => {
        if (!message.member.permissions.has('Administrator')) {
            message.channel.send("❌ You do not have permission to use this command.");
            return;
        }

        if (args.length < 2) {
            return message.reply('Please specify a team name (Team Valor or Team Instinct) and mention at least one user.');
        }

        const teamName = args[0].toLowerCase();

        if (!['valor', 'instinct'].includes(teamName)) {
            return message.reply('Please specify a valid team name: Team Valor or Team Instinct.');
        }

        const mentionedUsers = message.mentions.users;

        if (mentionedUsers.size === 0) {
            return message.reply('Please mention at least one user to add to the team.');
        }

        const userIds = [...mentionedUsers.keys()];

        // Add each user to the team
        userIds.forEach(userId => {
            addTag(userId, teamName);
        });

        message.reply(`Added users to Team ${teamName.charAt(0).toUpperCase() + teamName.slice(1)}: ${userIds.map(id => `<@${id}>`).join(', ')}`);
    },

    // Export utility functions for use in other commands
    addTag,
    removeTag,
    hasTag
};