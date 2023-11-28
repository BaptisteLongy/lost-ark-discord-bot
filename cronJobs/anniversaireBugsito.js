const CronJob = require('cron').CronJob;
const logger = require('../tools/logger.js');

function reminderAnnivBugsito(client) {

	// Don't forget to substract 1 to month - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date#monthindex
	const d = new Date(2023, 11, 2, 7);

	new CronJob(
		d,
		// For Dev - every 10 seconds
		// '0,10,20,30,40,50 * * * * *',
		async function() {
			try {
				const notificationChannel = await client.channels.cache.get(process.env.DISCORD_SERVER_NOTIFICATION_CHANNEL);
				notificationChannel.send('**Et on n\'oublie pas de souhaiter son anniversaire à Bugsito !!!**');
			} catch (error) {
				const notificationChannel = await client.channels.cache.get(process.env.DISCORD_SERVER_NOTIFICATION_CHANNEL);
				logger.logError(notificationChannel.guild, error);
			}
		},
		null,
		true,
	);
}

module.exports = {
	reminderAnnivBugsito,
};