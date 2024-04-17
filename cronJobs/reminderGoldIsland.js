const CronJob = require('cron').CronJob;
const logger = require('../tools/logger.js');
const fs = require('fs');

function reminderGoldIslandIsToday(client) {
    new CronJob(
        '0 30 8 * * *',
        // For Dev - every 5 seconds
        // '*/5 * * * * *',
        async function() {
            try {
                const goldIslandDateArray = fs.readFileSync(process.env.DISCORD_BOT_GOLD_ISLAND_CONFIG_FILE).toString().split('\n');
                const today = new Date().toDateString();

                for (const i in goldIslandDateArray) {
                    const loopDate = new Date(goldIslandDateArray[i]).toDateString();
                    if (loopDate === today) {
                        const notificationChannel = await client.channels.cache.get(process.env.DISCORD_SERVER_NOTIFICATION_CHANNEL);
                        notificationChannel.send('@here **N\'oubliez pas qu\'aujourd\'hui c\'est double ile à gold, alors allez faire votre ile d\'aventure à 11h**');
                    }
                }
            } catch (error) {
                const notificationChannel = await client.channels.cache.get(process.env.DISCORD_SERVER_NOTIFICATION_CHANNEL);
                logger.logError(notificationChannel.guild, error);
            }
        },
        null,
        true,
    );
}

function reminderGoldIslandIsTomorrow(client) {
    new CronJob(
        '0 30 10 * * *',
        // For Dev - every 5 seconds
        // '*/5 * * * * *',
        async function() {
            try {
                const goldIslandDateArray = fs.readFileSync(process.env.DISCORD_BOT_GOLD_ISLAND_CONFIG_FILE).toString().split('\n');
                let tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow = tomorrow.toDateString();

                for (const i in goldIslandDateArray) {
                    const loopDate = new Date(goldIslandDateArray[i]).toDateString();
                    if (loopDate === tomorrow) {
                        const notificationChannel = await client.channels.cache.get(process.env.DISCORD_SERVER_NOTIFICATION_CHANNEL);
                        notificationChannel.send('@here **N\'oubliez pas que demain c\'est double ile à gold, alors ne faites pas votre ile d\'aventure aujourd\'hui**');
                    }
                }
            } catch (error) {
                const notificationChannel = await client.channels.cache.get(process.env.DISCORD_SERVER_NOTIFICATION_CHANNEL);
                logger.logError(notificationChannel.guild, error);
            }
        },
        null,
        true,
    );
}

module.exports = {
    reminderGoldIslandIsToday,
    reminderGoldIslandIsTomorrow,
};