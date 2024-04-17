const { todoOfficersJob } = require('./todoOfficersJob.js');
const { reminderJob } = require('./reminderJob.js');
// const { reminderGVGRegistration } = require('./reminderGVGRegistration.js');
const { reminderEventEndDate } = require('./reminderEventEndDate.js');
const { checkLegendaryCards } = require('./checkLegendaryCards.js');
const { reminderGoldIslandIsToday, reminderGoldIslandIsTomorrow } = require('./reminderGoldIsland.js');

function initCronJobs(client) {
    todoOfficersJob(client);
    reminderJob(client);
    // GVG disabled for now
    // reminderGVGRegistration(client);
    reminderEventEndDate(client);
    checkLegendaryCards(client);
    reminderGoldIslandIsToday(client);
    reminderGoldIslandIsTomorrow(client);
}

module.exports = {
    initCronJobs,
};