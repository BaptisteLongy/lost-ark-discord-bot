const { todoOfficersJob } = require('./todoOfficersJob.js');
const { reminderJob } = require('./reminderJob.js');
// const { reminderGVGRegistration } = require('./reminderGVGRegistration.js');
const { reminderEventEndDate } = require('./reminderEventEndDate.js');
const { checkLegendaryCards } = require('./checkLegendaryCards.js');
const { reminderGoldIslandIsToday, reminderGoldIslandIsTomorrowOnWeekDays, reminderGoldIslandIsTomorrowOnWeekEnds } = require('./reminderGoldIsland.js');
const { scrapeHellfestInfo } = require('./checkHellfest.js');


function initCronJobs(client) {
    todoOfficersJob(client);
    reminderJob(client);
    // GVG disabled for now
    // reminderGVGRegistration(client);
    reminderEventEndDate(client);
    checkLegendaryCards(client);
    reminderGoldIslandIsToday(client);
    reminderGoldIslandIsTomorrowOnWeekDays(client);
    reminderGoldIslandIsTomorrowOnWeekEnds(client);
    scrapeHellfestInfo(client);
}

module.exports = {
    initCronJobs,
};