const CronJob = require('cron').CronJob;
const logger = require('../tools/logger.js');
const fs = require('fs');

async function generateArrayWithMessages(guild) {
	const todoList = [];

	// GVG disabled for now
	// Check GVG Status
	// const today = new Date();
	// if (today.getDay() === 0 || today.getDay() > 3) {
	// 	todoList.push('   :white_check_mark:   Il faut recruter pour la GVG. Checkez le nombre d\'inscrits in game puis utilisez `/gvg publicite`');
	// }

	// Check awaiting members
	await guild.members.fetch();
	const awaitingRole = await guild.roles.fetch(process.env.DISCORD_SERVER_AWAITING_MEMBER_ROLE, { cache: false, force: true });
	if (awaitingRole.members.size > 0) {
		todoList.push(`   :white_check_mark:   Il y a ${awaitingRole.members.size} membre${awaitingRole.members.size === 1 ? '' : 's'} parmis les ${awaitingRole}. Vérifiez ce qu'on doit en faire.`);
	}

	// Bump recruiting posts
	const today = new Date();
	if (today.getDay() === 3 || today.getDay() === 6) {
		const bumpListConfig = JSON.parse(fs.readFileSync(process.env.DISCORD_BOT_RECRUITING_BUMP_CONFIG_FILE));
		const bumpMessage = bumpListConfig.reduce((prev, current) => {
			return `${prev}\n       :arrow_right: ${current.label} : ${current.postLink}`;
		}, '   :white_check_mark:   Relances à faire pour le recrutement :');

		todoList.push(bumpMessage);
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
		'0 0 10 * * *',
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
				const logChannel = await client.channels.cache.get(process.env.DISCORD_LOG_CHANNEL);
				logger.logError(logChannel.guild, error);
			}
		},
		null,
		true,
	);
}

module.exports = {
	todoOfficersJob,
};