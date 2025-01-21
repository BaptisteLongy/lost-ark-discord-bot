const CronJob = require('cron').CronJob;
const logger = require('../tools/logger.js');
const fs = require('fs');

function reminderEventEndDate(client) {
	new CronJob(
		'0 0 19 * * 2',
        // For Dev - every 5 seconds
        // '*/5 * * * * *',
		async function() {
			try {
				const eventEndDateArray = fs.readFileSync(process.env.DISCORD_BOT_EVENT_END_DATE_CONFIG_FILE).toString().split('\n');
				const tomorrow = new Date();
				tomorrow.setDate(tomorrow.getDate() + 1);

				for (const i in eventEndDateArray) {
					const loopDate = new Date(eventEndDateArray[i]).toDateString();
					if (loopDate === tomorrow.toDateString()) {
						const notificationChannel = await client.channels.cache.get(process.env.DISCORD_SERVER_NOTIFICATION_CHANNEL);
						notificationChannel.send('@here **L\'event se finit demain, n\'oubliez pas d\'échanger toutes les pièces qu\'il vous reste  !!!**');
					}

				}
			} catch (error) {
				const logChannel = await client.channels.cache.get(process.env.DISCORD_LOG_CHANNEL);
				logger.logError(logChannel.guild, error);
			}
		},
		null,
		true,
	);
}

module.exports = {
	reminderEventEndDate,
};