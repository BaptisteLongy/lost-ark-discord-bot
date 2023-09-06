const dotenv = require('dotenv');
dotenv.config();
const logger = require('./tools/logger.js');
const days = require('./tools/days.json');
const CronJob = require('cron').CronJob;

// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { createCollection } = require('./tools/createCollection.js');

const token = process.env.LOST_ARK_DISCORD_BOT_TOKEN;

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

// Build the commands Collection for easy access
createCollection(client, 'commands');

// Build the selectMenus Collection for easy access
createCollection(client, 'selectMenuHandlers');

// Build the buttons Collection for easy access
createCollection(client, 'buttonHandlers');

// Build the modals Collection for easy access
createCollection(client, 'modalHandlers');

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Slash command listener
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		logger.logError(interaction.guild, error, interaction.member, `/${interaction.commandName}`);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// Select menu listener
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isStringSelectMenu()) return;

	const selectMenu = interaction.client.selectMenuHandlers.get(interaction.customId);

	if (!selectMenu) {
		console.error(`No select menu matching ${interaction.customId} was found.`);
		return;
	}

	try {
		await selectMenu.execute(interaction);
	} catch (error) {
		console.error(error);
		logger.logError(interaction.guild, error, interaction.member, `/${interaction.customId}`);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this select menu!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this select menu!', ephemeral: true });
		}
	}
});

// Buttons listener
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isButton()) return;

	const button = interaction.client.buttonHandlers.get(interaction.customId);

	if (!button) {
		console.error(`No button matching ${interaction.customId} was found.`);
		return;
	}

	try {
		await button.execute(interaction);
	} catch (error) {
		console.error(error);
		logger.logError(interaction.guild, error, interaction.member, `/${interaction.customId}`);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this button!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this button!', ephemeral: true });
		}
	}
});

// Modal listener
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isModalSubmit()) return;

	const modal = interaction.client.modalHandlers.get(interaction.customId);

	if (!modal) {
		console.error(`No modal matching ${interaction.customId} was found.`);
		return;
	}

	try {
		await modal.execute(interaction);
	} catch (error) {
		console.error(error);
		logger.logError(interaction.guild, error, interaction.member, `/${interaction.customId}`);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this modal!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this modal!', ephemeral: true });
		}
	}
});

function getIDForTag(tagName, tagList) {
	return tagList.find(tag => tag.name === tagName).id;
}

const reminderJob = new CronJob(
	'0,10,20,30,40,50 * * * * *',
	async function() {
		// console.log('You will see this message every minute');
		let dayBefore = new Date().getDay() - 1;
		if (dayBefore === -1) { dayBefore = 6; }
		const dayBeforeName = days.find(day => day.index === dayBefore).name;
		const forum = await client.channels.cache.get(process.env.DISCORD_RAID_FORUM_CHANNEL);

		const dayBeforeTagId = getIDForTag(dayBeforeName, forum.availableTags);
		await forum.threads.fetch();
		for (const cacheObject of forum.threads.cache) {
			const channel = await cacheObject[1].fetch();
			const lastMessage = await channel.messages.fetch(channel.lastMessageId);
			if (lastMessage.content.includes('Vous avez toujours besoin de ce raid ?')) {
				await channel.delete();
				logger.logMessage(channel.guild, `Id: ${channel.id} : raid supprimé automatiquement pour délai dépassé + inactivité`);
			} else if (channel.appliedTags.find(tag => tag === dayBeforeTagId)) {
				channel.send(
					{
						content: '@here Vous avez toujours besoin de ce raid ?\nSans activité d\'ici demain, je le supprimerai automatiquement.\nPour empécher la supression, il suffit d\'envoyer un message sur le thread.',
					},
				);
				logger.logMessage(channel.guild, `Id: ${channel.id} : message de suppression programmée envoyé`);
			}
		}
	},
	null,
	false,
);

// Log in to Discord with your client's token
client.login(token);

reminderJob.start();