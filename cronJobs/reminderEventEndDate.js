const CronJob = require('cron').CronJob;
const logger = require('../tools/logger.js');

function reminderEventEndDate(client) {

	// 5pm the day before the end of the event
	// Don't forget to substract 1 to month - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date#monthindex
	const d = new Date(2023, 11, 12, 17);

	new CronJob(
		d,
		// For Dev - every 10 seconds
		// '0,10,20,30,40,50 * * * * *',
		async function() {
			try {
				const notificationChannel = await client.channels.cache.get(process.env.DISCORD_SERVER_NOTIFICATION_CHANNEL);
				notificationChannel.send('@here **L\'event se finit demain, n\'oubliez pas d\'échanger toutes les pièces qu\'il vous reste  !!!**');
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
	reminderEventEndDate,
};