const dotenv = require('dotenv');
dotenv.config();

const logChannelId = process.env.DISCORD_LOG_CHANNEL;
const logLevel = process.env.DISCORD_BOT_LOG_LEVEL;

function logAction(interaction, message) {
    interaction.guild.channels.fetch(logChannelId)
        .then(channel => channel.send(message))
        .catch(console.error);
}

function logError(guild, error, member, interaction) {
    guild.channels.fetch(logChannelId)
        .then(channel => {
            const errorMessage = ''.concat(
                `Discord Error Code: ${error.code}\n`,
                `URL: ${error.url}\n`,
                `Method: ${error.method}\n`,
                `Status: ${error.status}\n`,
                `Message: ${error.message}\n`,
                'Stack:\n',
                error.stack,
            );

            if (interaction !== undefined && member !== undefined) {
                channel.send(`${member} a fait planter le bot sur une commande ${interaction}`);
            }
            channel.send(errorMessage);
        })
        .catch(console.error);
}

function logMessage(guild, message) {
    guild.channels.fetch(logChannelId)
        .then(channel => {
            channel.send(message);
        })
        .catch(console.error);
}

function logDebugInfo(guild, message) {
    if (logLevel === 'DEBUG') {
        guild.channels.fetch(logChannelId)
            .then(channel => {
                channel.send(`DEBUG INFO\n${message}`);
            })
            .catch(console.error);
    }
}

module.exports = {
    logAction,
    logError,
    logMessage,
    logDebugInfo,
};