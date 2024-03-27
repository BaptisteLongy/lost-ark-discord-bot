const CronJob = require('cron').CronJob;
const logger = require('../tools/logger.js');

function vocalCleanUp(client) {
    new CronJob(
        '0 */5 * * * *',
        // For Dev - every 5 seconds
        // '*/5 * * * * *',
        async function() {
            try {
                const voiceChannel = await client.channels.fetch(process.env.DISCORD_VOICE_CHANNEL_CREATOR_ID);
                for (const channel of voiceChannel.parent.children.cache.values()) {
                    if (channel.name.startsWith('Chez ')) {
                        if (!(channel.members && channel.members.size > 0)) {
                            await channel.delete();
                        }
                    }
                }
            } catch (error) {
                const officerChannel = await client.channels.cache.get(process.env.DISCORD_OFFICER_CHANNEL);
                logger.logError(officerChannel.guild, error);
            }
        },
        null,
        true,
    );
}

module.exports = {
    vocalCleanUp,
};