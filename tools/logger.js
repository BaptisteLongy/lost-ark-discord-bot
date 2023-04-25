const dotenv = require('dotenv');
dotenv.config();

const logChannelId = process.env.DISCORD_LOG_CHANNEL;

function logAction(interaction, message) {
    interaction.guild.channels.fetch(logChannelId)
        .then(channel => channel.send(message))
        .catch(console.error);
}

function logError(guild, error, member, interaction) {
    guild.channels.fetch(logChannelId)
        .then(channel => {
            channel.send(`${member} a fait planter le bot sur une commande ${interaction}`);
            channel.send(error.stack);
        })
        .catch(console.error);
}

module.exports = {
    logAction,
    logError,
};