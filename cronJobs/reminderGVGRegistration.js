const CronJob = require('cron').CronJob;
const logger = require('../tools/logger.js');

function reminderGVGRegistration(client) {
	new CronJob(
		'0 0 16 0 * 0',
		// For Dev - every 10 seconds
		// '0,10,20,30,40,50 * * * * *',
		async function() {
			try {
				const officerChannel = await client.channels.cache.get(process.env.DISCORD_OFFICER_CHANNEL);
                officerChannel.send('@here **Si ce n\'est déjà FormattingPatterns, n\'oubliez pas d\'inscrire la guilde en GVG !!!**');
			} catch (error) {
				const officerChannel = await client.channels.cache.get(process.env.DISCORD_OFFICER_CHANNEL);
				logger.logError(officerChannel.guild, error);
			}
		},
		null,
		true,
	);
}

module.exports = {
	reminderGVGRegistration,
};