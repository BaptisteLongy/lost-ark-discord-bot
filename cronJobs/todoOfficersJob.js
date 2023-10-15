const CronJob = require('cron').CronJob;
const logger = require('../tools/logger.js');

async function generateArrayWithMessages(guild) {
	const todoList = [];

	// Check GVG Status
	const today = new Date();
	if (today.getDay() === 0 || today.getDay() > 3) {
		todoList.push('   :white_check_mark:   Il faut recruter pour la GVG. Checkez le nombre d\'inscrits in game puis utilisez `/gvg publicite`');
	}

	// Check awaiting members
	await guild.members.fetch();
	const awaitingRole = await guild.roles.fetch(process.env.DISCORD_SERVER_AWAITING_MEMBER_ROLE, { cache: false, force: true });
	if (awaitingRole.members.size > 0) {
		todoList.push(`   :white_check_mark:   Il y a ${awaitingRole.members.size} membre${awaitingRole.members.size === 1 ? '' : 's'} parmis les ${awaitingRole}. Vérifiez ce qu'on doit en faire.`);
	}

	// Return to do list
	return todoList;
}

function sendToDoMessageFromArray(channel, todoList) {
	const message = todoList.reduce((prev, current) => {
		return `${prev}\n${current}`;
	}, '@here **P\'tite liste des trucs à faire :**');
	channel.send(message);
}

function todoOfficersJob(client) {
	new CronJob(
		'0 0 8 * * *',
		// For Dev - every 10 seconds
		// '0,10,20,30,40,50 * * * * *',
		async function() {
			try {
				const officerChannel = await client.channels.cache.get(process.env.DISCORD_OFFICER_CHANNEL);
				const todoList = await generateArrayWithMessages(officerChannel.guild);
				if (todoList.length > 0) {
					sendToDoMessageFromArray(officerChannel, todoList);
					logger.logMessage(officerChannel.guild, 'Info: Todo list envoyée aux officiers');
				} else {
					logger.logMessage(officerChannel.guild, 'Info: Todo list des officiers vide. Je saute');
				}
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
	todoOfficersJob,
};