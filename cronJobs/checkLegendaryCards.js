const CronJob = require('cron').CronJob;
const logger = require('../tools/logger.js');
const legendaryCardsInMerchants = require('../tools/legendaryCardsInMerchants.json');
const puppeteer = require('puppeteer');
const { delay } = require('../tools/delay.js');

async function pingCardRolesIfNecessary(cardList, client) {
    for (const card in cardList) {
        if (!global.recentlyPingedCards.some(pingedCard => pingedCard === cardList[card])) {
            const legendaryCard = legendaryCardsInMerchants.find(legCard => legCard.name === cardList[card]);
            if (legendaryCard !== undefined) {
                const roleToPing = legendaryCard.roleEnvVar;
                const notificationChannel = await client.channels.cache.get(process.env.DISCORD_SERVER_CARD_NOTIFICATION_CHANNEL);
                notificationChannel.send(`${await notificationChannel.guild.roles.fetch(process.env[roleToPing])} vient d'être ajouté sur https://lostmerchants.com. En route !`);
                global.recentlyPingedCards.push(cardList[card]);
                logger.logMessage(notificationChannel.guild, `Ping envoyé pour ${cardList[card]}`);
            }
        }
    }
}

function cleanUpGlobalRecentlyPingedCards(cardList) {
    global.recentlyPingedCards = global.recentlyPingedCards.filter(pingedCard => cardList.some(card => card === pingedCard));
}

async function scrapeLegendaryInfo() {
    const browser = await puppeteer.launch({ headless: 'shell' });
    const page = await browser.newPage();
    await page.goto('https://lostmerchants.com/');
    await page.waitForSelector('select#severRegion');
    await page.select('select#severRegion', 'EUC');
    await page.waitForSelector('select#server');
    await page.select('select#server', 'Arcturus');
    await delay(10000);
    const legendaryInfo = await page.$$eval('.rarity--Legendary', options => {
        return options.map(option => option.textContent);
    });
    await browser.close();
    return legendaryInfo;
}

function checkLegendaryCards(client) {
    new CronJob(
        '0 */5 * * * *',
        // For Dev - every 10 seconds
        // '*/10 * * * * *',
        async function() {
            try {
                const cardList = await scrapeLegendaryInfo();
                await pingCardRolesIfNecessary(cardList, client);
                cleanUpGlobalRecentlyPingedCards(cardList);
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