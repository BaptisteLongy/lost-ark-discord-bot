const CronJob = require('cron').CronJob;
const logger = require('../tools/logger.js');

function reminderGVGRegistration(client) {
	new CronJob(
		'0 0 18 * * 0',
		// For Dev - every 10 seconds
		// '0,10,20,30,40,50 * * * * *',
		async function() {
			try {
				const officerChannel = await client.channels.cache.get(process.env.DISCORD_OFFICER_CHANNEL);
                officerChannel.send('@here **Si ce n\'est déjà fait, n\'oubliez pas d\'inscrire la guilde en GVG !!!**');
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
	reminderGVGRegistration,
};