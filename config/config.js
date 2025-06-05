require('dotenv').config();

module.exports = {
    token: process.env.TOKEN,
    emoji: "<:Pokecoin:1330070333365030963>",
    emojiUrl: 'https://cdn.discordapp.com/emojis/1330070333365030963.webp?size=56',
    channels: {
        pokeball: "pokéball-bot",
        inventory: "pokestop-inventory",
        logs: "1353491670707994676",
        superSpinLogs: "1335733364283543572"
    },
    roles: {
        pokestop: "PokéStop",
        superSpin: "SuperSpin",
        player: "player",
        dead: "dead"
    },
    paths: {
        data: './data.json',
        items: './items.json',
        avatarDefault: './pokestop.png',
        avatarRocket: './rocketstop.png'
    }
};
