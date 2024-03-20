const CronJob = require('cron').CronJob;
const logger = require('../tools/logger.js');
const puppeteer = require('puppeteer');
const { delay } = require('../tools/delay.js');
async function scrapeLegendaryInfo() {
    const browser = await puppeteer.launch({ headless: 'shell' });
    const page = await browser.newPage();
    await page.goto('https://lostmerchants.com/');
    await page.waitForSelector('select#severRegion');
    await page.select('select#severRegion', 'EUC');
    await page.waitForSelector('select#server');
    await page.select('select#server', 'Arcturus');
    await delay(2000);
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
    checkLegendaryCards,
};