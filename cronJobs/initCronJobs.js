const { todoOfficersJob } = require('./todoOfficersJob.js');
const { reminderJob } = require('./reminderJob.js');
const { reminderEventEndDate } = require('./reminderEventEndDate.js');
const { checkLegendaryCards } = require('./checkLegendaryCards.js');
const { reminderGoldIslandIsToday, reminderGoldIslandIsTomorrowOnWeekDays, reminderGoldIslandIsTomorrowOnWeekEnds } = require('./reminderGoldIsland.js');


function initCronJobs(client) {
    todoOfficersJob(client);
    reminderJob(client);
    reminderEventEndDate(client);
    checkLegendaryCards(client);
    reminderGoldIslandIsToday(client);
    reminderGoldIslandIsTomorrowOnWeekDays(client);
    reminderGoldIslandIsTomorrowOnWeekEnds(client);
}

module.exports = {
    initCronJobs,
};