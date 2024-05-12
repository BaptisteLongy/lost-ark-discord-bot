const CronJob = require('cron').CronJob;
const logger = require('../tools/logger.js');
const days = require('../tools/days.json');
const { getIDForTag } = require('../tools/getIDForTag.js');

function getTagIDForDayBefore(tagList, numberOfDaysBefore) {
    let dayBefore = new Date().getDay() - numberOfDaysBefore;
    if (dayBefore <= 0) { dayBefore = dayBefore + 7; }
    const dayBeforeName = days.find(day => day.index === dayBefore).name;
    const dayBeforeTagId = getIDForTag(dayBeforeName, tagList);
    return dayBeforeTagId;
}

function reminderJob(client) {
    new CronJob(
        '0 0 8 * * *',
        // For Dev - every 10 seconds
        // '0,10,20,30,40,50 * * * * *',
        async function() {
            try {
                // Init the work
                const forum = await client.channels.cache.get(process.env.DISCORD_RAID_FORUM_CHANNEL);
                logger.logMessage(forum.guild, 'Processus de nettoyage démarré');
                await forum.fetch();
                const dayBeforeTagId = getTagIDForDayBefore(forum.availableTags, 1);
                const twoDaysBeforeTagId = getTagIDForDayBefore(forum.availableTags, 2);

                for (const cacheObject of forum.threads.cache) {
                    // Get channel and last message of the channel
                    const channel = await cacheObject[1].fetch();
                    const fetchedMessage = await channel.messages.fetch({ limit: 1, around: channel.lastMessageId });
                    const lastMessage = fetchedMessage.values().next().value;

                    if (channel.appliedTags.find(tag => tag === twoDaysBeforeTagId) && lastMessage.content.includes('Vous avez toujours besoin de ce raid ?')) {
                        await channel.delete();
                        logger.logMessage(channel.guild, `Id: ${channel.id} : raid supprimé automatiquement pour délai dépassé + inactivité`);
                    } else if (channel.appliedTags.find(tag => tag === dayBeforeTagId)) {
                        channel.send('@here Vous avez toujours besoin de ce raid ?\nSans activité d\'ici demain, je le supprimerai automatiquement.\nPour empécher la suppression, il suffit d\'envoyer un message sur le thread.\nLe créateur ou un admin peut également utiliser /update pour mettre à jour la date et l\'heure');
                        logger.logMessage(channel.guild, `Id: ${channel.id} : message de suppression programmée envoyé`);
                    }
                }
                logger.logMessage(forum.guild, 'Processus de nettoyage terminé');
            } catch (error) {
                const forum = await client.channels.cache.get(process.env.DISCORD_RAID_FORUM_CHANNEL);
                console.error(error);
                logger.logError(forum.guild, error);
            }
        },
        null,
        true,
    );
}

module.exports = {
    reminderJob,
};