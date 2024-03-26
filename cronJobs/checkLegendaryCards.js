const CronJob = require('cron').CronJob;
const logger = require('../tools/logger.js');
const legendaryCardsInMerchants = require('../tools/legendaryCardsInMerchants.json');
const ratikLegendaryCardPingList = require('../ratikLegendaryCardPingList.json');
const puppeteer = require('puppeteer');
const { delay } = require('../tools/delay.js');

async function pingCardRolesIfNecessary(cardList, globalList, client, serverName) {
    for (const card in cardList) {
        if (!globalList.some(pingedCard => pingedCard === cardList[card])) {
            const legendaryCard = legendaryCardsInMerchants.find(legCard => legCard.name === cardList[card]);
            if (legendaryCard !== undefined) {
                const roleToPing = legendaryCard.roleEnvVar;
                const notificationChannel = await client.channels.cache.get(process.env.DISCORD_SERVER_CARD_NOTIFICATION_CHANNEL);
                notificationChannel.send(`${await notificationChannel.guild.roles.fetch(process.env[roleToPing])} vient d'être ajouté sur https://lostmerchants.com. En route !`);
                globalList.push(cardList[card]);
                logger.logMessage(notificationChannel.guild, `Ping envoyé pour ${cardList[card]} sur ${serverName}`);
            }
        }
    }
}

async function pingUsersForCardIfNecessary(cardList, globalList, client, serverName, pingList) {
    for (const card in cardList) {
        if (!globalList.some(pingedCard => pingedCard === cardList[card])) {
            const legendaryCard = legendaryCardsInMerchants.find(legCard => legCard.name === cardList[card]);
            if (legendaryCard !== undefined) {
                const legCardPingInfo = pingList.find(info => info.name === legendaryCard.name);

                for (const user in legCardPingInfo.pingList) {
                    const discordUser = await client.users.fetch(legCardPingInfo.pingList[user].discordId);
                    const whisperChannel = await discordUser.createDM();
                    await whisperChannel.send(`${legendaryCard.name} vient d'être ajouté sur https://lostmerchants.com. En route !`);
                }
                globalList.push(cardList[card]);
                const notificationChannel = await client.channels.cache.get(process.env.DISCORD_SERVER_CARD_NOTIFICATION_CHANNEL);
                logger.logMessage(notificationChannel.guild, `MP envoyé pour ${cardList[card]} sur ${serverName}`);
            }
        }
    }
}

function cleanUpGlobalRecentlyPingedCards(cardList, globalList) {
    return globalList.filter(pingedCard => cardList.some(card => card === pingedCard));
}

async function scrapeLegendaryInfo(serverName) {
    const browser = await puppeteer.launch({ headless: 'shell' });
    const page = await browser.newPage();
    await page.goto('https://lostmerchants.com/');
    await page.waitForSelector('select#severRegion');
    await page.select('select#severRegion', 'EUC');
    await page.waitForSelector('select#server');
    await page.select('select#server', serverName);
    await delay(10000);
    const legendaryInfo = await page.$$eval('.rarity--Legendary', options => {
        return options.map(option => option.textContent);
    });
    await browser.close();
    return legendaryInfo;
}

async function checkCardsForArcturus(client) {
    const cardList = await scrapeLegendaryInfo('Arcturus');
    await pingCardRolesIfNecessary(cardList, global.recentlyPingedCardsForArcturus, client, 'Arcturus');
    global.recentlyPingedCardsForArcturus = cleanUpGlobalRecentlyPingedCards(cardList, global.recentlyPingedCardsForArcturus);
}

async function checkCardsForRatik(client) {
    const cardList = await scrapeLegendaryInfo('Ratik');
    await pingUsersForCardIfNecessary(cardList, global.recentlyPingedCardsForRatik, client, 'Ratik', ratikLegendaryCardPingList);
    global.recentlyPingedCardsForRatik = cleanUpGlobalRecentlyPingedCards(cardList, global.recentlyPingedCardsForRatik);
}

function checkLegendaryCards(client) {
    new CronJob(
        '0 */5 * * * *',
        // For Dev - every 10 seconds
        // '*/10 * * * * *',
        async function() {
            try {
                await checkCardsForArcturus(client);
                await checkCardsForRatik(client);
            } catch (error) {
                if (error instanceof puppeteer.TimeoutError) {
                    const notificationChannel = await client.channels.cache.get(process.env.DISCORD_SERVER_NOTIFICATION_CHANNEL);
                    logger.logMessage(notificationChannel.guild, 'Lost merchants en timeout, tout devrait aller mieux dans 5 minutes');
                } else {
                    const notificationChannel = await client.channels.cache.get(process.env.DISCORD_SERVER_NOTIFICATION_CHANNEL);
                    logger.logError(notificationChannel.guild, error);
                }
            }
        },
        null,
        true,
    );
}

module.exports = {
    checkLegendaryCards,
};