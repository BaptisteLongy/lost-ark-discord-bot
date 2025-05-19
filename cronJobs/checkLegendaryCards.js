const CronJob = require('cron').CronJob;
const logger = require('../tools/logger.js');
const { GoogleAuth } = require('google-auth-library');

async function pingCardRolesIfNecessary(cardList, serverConfig, client) {
    for (const card in cardList) {
        const legendaryCard = serverConfig.pingList.find(legCard => legCard.name === cardList[card]);
        if (legendaryCard !== undefined) {
            if (!global.recentlyPingedCards[serverConfig.serverName].pingedCards.some(pingedCard => pingedCard === cardList[card])) {
                const notificationChannel = await client.channels.cache.get(process.env.DISCORD_SERVER_CARD_NOTIFICATION_CHANNEL);
                await notificationChannel.send(`${await notificationChannel.guild.roles.fetch(legendaryCard.roleEnvVar)} vient d'être ajouté sur https://lostmerchants.com. En route !`);
                global.recentlyPingedCards[serverConfig.serverName].pingedCards.push(cardList[card]);
                logger.logMessage(notificationChannel.guild, `Ping envoyé pour ${cardList[card]} sur ${serverConfig.serverName}`);
            }
        }
    }
}

async function pingUsersForCardIfNecessary(cardList, serverConfig, client) {
    for (const card in cardList) {
        const legendaryCard = serverConfig.pingList.find(legCard => legCard.name === cardList[card]);
        if (legendaryCard !== undefined) {
            if (!global.recentlyPingedCards[serverConfig.serverName].pingedCards.some(pingedCard => pingedCard === cardList[card])) {
                for (const user in legendaryCard.pingList) {
                    const discordUser = await client.users.fetch(legendaryCard.pingList[user].discordId);
                    const whisperChannel = await discordUser.createDM();
                    await whisperChannel.send(`**${legendaryCard.name}** vient d'être ajouté sur https://lostmerchants.com. En route !`);
                }
                global.recentlyPingedCards[serverConfig.serverName].pingedCards.push(cardList[card]);
                const logChannel = await client.channels.cache.get(process.env.DISCORD_LOG_CHANNEL);
                logger.logMessage(logChannel.guild, `MP envoyés pour ${cardList[card]} sur ${serverConfig.serverName}`);
            }
        }
    }
}

function setupNewTimer(cardList, globalList) {
    if (cardList[0] > globalList.lastLostMerchantTimer) {
        globalList.pingedCards = [];
    }
    globalList.lastLostMerchantTimer = cardList[0];
    return globalList;
}

async function scrapeLegendaryInfo(serverName) {
    const auth = new GoogleAuth();
    const client = await auth.getIdTokenClient(process.env.LEGENDARY_CARD_SNIFFER_ENDPOINT);

    let legendaryInfo;
    const legendaryInfoResponse = await client.request({ url: `${process.env.LEGENDARY_CARD_SNIFFER_ENDPOINT}/${serverName}` });
    if (legendaryInfoResponse.status === 200) {
        legendaryInfo = legendaryInfoResponse.data;
    }

    return legendaryInfo;
}

async function checkCardsForServer(serverConfig, client) {
    const cardList = await scrapeLegendaryInfo(serverConfig.serverName);
    if (Array.isArray(cardList)) {
        global.recentlyPingedCards[serverConfig.serverName] = setupNewTimer(cardList, global.recentlyPingedCards[serverConfig.serverName]);
        await pingCardRolesIfNecessary(cardList, serverConfig, client);
    }
}

async function checkCardsForUsers(serverConfig, client) {
    const cardList = await scrapeLegendaryInfo(serverConfig.serverName);
    if (Array.isArray(cardList)) {
        global.recentlyPingedCards[serverConfig.serverName] = setupNewTimer(cardList, global.recentlyPingedCards[serverConfig.serverName]);
        await pingUsersForCardIfNecessary(cardList, serverConfig, client);
    }
}

function checkLegendaryCards(client) {
    new CronJob(
        '0 0,15,30,45 * * * *',
        // For Dev - every 10 seconds
        // '*/10 * * * * *',
        async function() {
            try {
                const pingConfig = require(process.env.DISCORD_BOT_CARD_NOTIFICATION_CONFIG_FILE);

                for (const server in pingConfig) {
                    if (pingConfig[server].configurationType === 'server') {
                        await checkCardsForServer(pingConfig[server], client);
                    } else if (pingConfig[server].configurationType === 'users') {
                        await checkCardsForUsers(pingConfig[server], client);
                    }
                }
            } catch (error) {
                const logChannel = await client.channels.cache.get(process.env.DISCORD_LOG_CHANNEL);
                logger.logError(logChannel.guild, error);
            }
        },
        null,
        true,
    );
}

module.exports = {
    checkLegendaryCards,
};