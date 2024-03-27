const { todoOfficersJob } = require('./todoOfficersJob.js');
const { reminderJob } = require('./reminderJob.js');
// const { reminderGVGRegistration } = require('./reminderGVGRegistration.js');
const { reminderEventEndDate } = require('./reminderEventEndDate.js');
const { checkLegendaryCards } = require('./checkLegendaryCards.js');
const { vocalCleanUp } = require('./vocalCleanUp.js');

function initCronJobs(client) {
    todoOfficersJob(client);
    reminderJob(client);
    // GVG disabled for now
    // reminderGVGRegistration(client);
    reminderEventEndDate(client);
    checkLegendaryCards(client);
    vocalCleanUp(client);
}

module.exports = {
    initCronJobs,
};