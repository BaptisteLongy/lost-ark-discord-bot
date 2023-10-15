const { todoOfficersJob } = require('./todoOfficersJob.js');

function initCronJobs(client) {
    todoOfficersJob(client);
}

module.exports = {
    initCronJobs,
};