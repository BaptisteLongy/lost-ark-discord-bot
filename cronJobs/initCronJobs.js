const { todoOfficersJob } = require('./todoOfficersJob.js');
const { reminderJob } = require('./reminderJob.js');
const { reminderGVGRegistration } = require('./reminderGVGRegistration.js');
const { reminderEventEndDate } = require('./reminderEventEndDate.js');
const { reminderAnnivBugsito } = require('./reminderAnnivBugsito.js');

function initCronJobs(client) {
    todoOfficersJob(client);
    reminderJob(client);
    reminderGVGRegistration(client);
    reminderEventEndDate(client);
    reminderAnnivBugsito(client);
}

module.exports = {
    initCronJobs,
};