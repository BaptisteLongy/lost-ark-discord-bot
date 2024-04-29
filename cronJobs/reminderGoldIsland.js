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
                        if (today.getDay() === 4 || today.getDay() === 6) {
                            notificationChannel.send('@here **⚠️ AUJOURD\'HUI : DOUBLE ILE A GOLD + CHAOS GATE ⚠️**\nIl est préférable de faire double chaos gate');
                        } else {
                            notificationChannel.send('@here **⚠️ AUJOURD\'HUI : DOUBLE ILE A GOLD ⚠️**');
                        }
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

function reminderGoldIslandIsTomorrowOnWeekDays(client) {
    new CronJob(
        // '0 30 10 * * 1-5',
        // For Dev - every 5 seconds
        '*/5 * * * * *',
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
                        if (tomorrow.getDay() === 4) {
                            notificationChannel.send('@here **⚠️ DEMAIN : ILE A GOLD + CHAOS GATE ⚠️**\nDouble ile à gold demain, mais également chaos gate.\nIl est préférable de faire double chaos gate');
                        } else {
                            notificationChannel.send('@here **⚠️ DEMAIN : ILE A GOLD ⚠️**\nDouble ile à gold demain, alors ne faites pas votre ile d\'aventure aujourd\'hui');
                        }
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

function reminderGoldIslandIsTomorrowOnWeekEnds(client) {
    new CronJob(
        '0 30 15 * * 0,6',
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
                        if (tomorrow.getDay() === 6) {
                            notificationChannel.send('@here **⚠️ DEMAIN : ILE A GOLD + CHAOS GATE ⚠️**\nDouble ile à gold demain, mais également chaos gate.\nIl est préférable de faire double chaos gate');
                        } else {
                            notificationChannel.send('@here **⚠️ DEMAIN : ILE A GOLD ⚠️**\nDouble ile à gold demain, alors ne faites pas votre ile d\'aventure aujourd\'hui');
                        }
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
    reminderGoldIslandIsTomorrowOnWeekDays,
    reminderGoldIslandIsTomorrowOnWeekEnds,
};