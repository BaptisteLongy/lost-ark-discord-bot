const { todoOfficersJob } = require('./todoOfficersJob.js');
const { reminderJob } = require('./reminderJob.js');
// const { reminderGVGRegistration } = require('./reminderGVGRegistration.js');
const { reminderEventEndDate } = require('./reminderEventEndDate.js');

function initCronJobs(client) {
    todoOfficersJob(client);
    reminderJob(client);
    // GVG disabled for now
    // reminderGVGRegistration(client);
    reminderEventEndDate(client);
}

module.exports = {
    initCronJobs,
};