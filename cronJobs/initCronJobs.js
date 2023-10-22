const { todoOfficersJob } = require('./todoOfficersJob.js');
const { reminderJob } = require('./reminderJob.js');
const { reminderGVGRegistration } = require('./reminderGVGRegistration.js');

function initCronJobs(client) {
    todoOfficersJob(client);
    reminderJob(client);
    reminderGVGRegistration(client);
}

module.exports = {
    initCronJobs,
};