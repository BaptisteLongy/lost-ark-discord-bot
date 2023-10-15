const { todoOfficersJob } = require('./todoOfficersJob.js');
const { reminderJob } = require('./reminderJob.js');

function initCronJobs(client) {
    todoOfficersJob(client);
    reminderJob(client);
}

module.exports = {
    initCronJobs,
};