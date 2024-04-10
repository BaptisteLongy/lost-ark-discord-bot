const { todoOfficersJob } = require('./todoOfficersJob.js');
const { reminderJob } = require('./reminderJob.js');
// const { reminderGVGRegistration } = require('./reminderGVGRegistration.js');
const { reminderEventEndDate } = require('./reminderEventEndDate.js');
const { checkLegendaryCards } = require('./checkLegendaryCards.js');

function initCronJobs(client) {
    todoOfficersJob(client);
    reminderJob(client);
    // GVG disabled for now
    // reminderGVGRegistration(client);
    reminderEventEndDate(client);
    checkLegendaryCards(client);
}

module.exports = {
    initCronJobs,
};