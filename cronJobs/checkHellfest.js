const puppeteer = require('puppeteer');
const CronJob = require('cron').CronJob;
const { delay } = require('../tools/delay.js');

async function notifyBugs(client, message) {
    const bugs = await client.users.fetch('300283244832751616');
    const whisperChannel = await bugs.createDM();
    await whisperChannel.send(message);
}

function scrapeHellfestInfo(client) {
    new CronJob(
        '0 */8 * * * *',
        // For Dev - every 10 seconds
        // '*/10 * * * * *',
        async function() {
            // const browser = await puppeteer.launch({ headless: 'shell' });
            const browser = await puppeteer.launch({ headless: false });

            try {
                const page = await browser.newPage();
                await page.goto('https://tickets.hellfest.fr/revente.html');
                await delay(5000);
                const elementHandle = await page.waitForSelector('div.inner iframe');
                const frame = await elementHandle.contentFrame();
                const ticketMessage = await frame.$eval('.wz-message-description', (message) => {
                    return (message.innerText.startsWith('Aucun billet disponible'));
                });
                if (!ticketMessage) {
                    await notifyBugs(client, 'Des place peut-être ? Faut aller voir https://tickets.hellfest.fr/revente.html');
                }
            } catch (error) {
                if (error.message.startsWith('Error: failed to find element matching selector')) {
                    await notifyBugs(client, '.wz-message-description not found');
                    await notifyBugs(client, 'Faut aller voir https://tickets.hellfest.fr/revente.html');
                } else {
                    await notifyBugs(client, error.message);
                    await notifyBugs(client, 'Faut aller voir https://tickets.hellfest.fr/revente.html');
                }
            } finally {
                await browser.close();
            }
        },
        null,
        true,
    );
}

module.exports = {
    scrapeHellfestInfo,
};