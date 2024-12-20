const CronJob = require('cron').CronJob;
const logger = require('../tools/logger.js');
const puppeteer = require('puppeteer');
const { delay } = require('../tools/delay.js');

async function pingCardRolesIfNecessary(cardList, serverConfig, client) {
    for (const card in cardList) {
        const legendaryCard = serverConfig.pingList.find(legCard => legCard.name === cardList[card]);
        if (legendaryCard !== undefined) {
            if (!global.recentlyPingedCards[serverConfig.serverName].some(pingedCard => pingedCard === cardList[card])) {
                const notificationChannel = await client.channels.cache.get(process.env.DISCORD_SERVER_CARD_NOTIFICATION_CHANNEL);
                await notificationChannel.send(`${await notificationChannel.guild.roles.fetch(legendaryCard.roleEnvVar)} vient d'être ajouté sur https://lostmerchants.com. En route !`);
                global.recentlyPingedCards[serverConfig.serverName].push(cardList[card]);
                logger.logMessage(notificationChannel.guild, `Ping envoyé pour ${cardList[card]} sur ${serverConfig.serverName}`);
            }
        }
    }
}

async function pingUsersForCardIfNecessary(cardList, serverConfig, client) {
    for (const card in cardList) {
        const legendaryCard = serverConfig.pingList.find(legCard => legCard.name === cardList[card]);
        if (legendaryCard !== undefined) {
            if (!global.recentlyPingedCards[serverConfig.serverName].some(pingedCard => pingedCard === cardList[card])) {
                for (const user in legendaryCard.pingList) {
                    const discordUser = await client.users.fetch(legendaryCard.pingList[user].discordId);
                    const whisperChannel = await discordUser.createDM();
                    await whisperChannel.send(`**${legendaryCard.name}** vient d'être ajouté sur https://lostmerchants.com. En route !`);
                }
                global.recentlyPingedCards[serverConfig.serverName].push(cardList[card]);
                const logChannel = await client.channels.cache.get(process.env.DISCORD_LOG_CHANNEL);
                logger.logMessage(logChannel.guild, `MP envoyés pour ${cardList[card]} sur ${serverConfig.serverName}`);
            }
        }
    }
}

function cleanUpGlobalRecentlyPingedCards(cardList, globalList) {
    return globalList.filter(pingedCard => cardList.some(card => card === pingedCard));
}

async function scrapeLegendaryInfo(serverName) {
    const browser = await puppeteer.launch({
        headless: 'shell',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
     });
    let legendaryInfo;
    try {
        const page = await browser.newPage();
        await page.goto('https://lostmerchants.com/', { waitUntil: 'networkidle0', timeout: 300000 });
        await page.waitForSelector('select#severRegion');
        await page.select('select#severRegion', 'EUC');
        await page.waitForSelector('select#server');
        await page.select('select#server', serverName);
        await delay(10000);
        legendaryInfo = await page.$$eval('.rarity--Legendary', options => {
            return options.map(option => option.textContent);
        });
        await browser.close();
    } catch (error) {
        await browser.close();
        if (error instanceof puppeteer.TimeoutError || error instanceof puppeteer.ProtocolError) {
            return undefined;
        } else {
            throw error;
        }
    } finally {
        await browser.close();
    }
    return legendaryInfo;
}

async function checkCardsForServer(serverConfig, client) {
    const cardList = await scrapeLegendaryInfo(serverConfig.serverName);
    if (Array.isArray(cardList)) {
        await pingCardRolesIfNecessary(cardList, serverConfig, client);
        global.recentlyPingedCards[serverConfig.serverName] = cleanUpGlobalRecentlyPingedCards(cardList, global.recentlyPingedCards[serverConfig.serverName]);
    }
}

async function checkCardsForUsers(serverConfig, client) {
    const cardList = await scrapeLegendaryInfo(serverConfig.serverName);
    if (Array.isArray(cardList)) {
        await pingUsersForCardIfNecessary(cardList, serverConfig, client);
        global.recentlyPingedCards[serverConfig.serverName] = cleanUpGlobalRecentlyPingedCards(cardList, global.recentlyPingedCards[serverConfig.serverName]);
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