const dotenv = require('dotenv');
dotenv.config();
const logger = require('./tools/logger.js');

// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');

// Personal imports
const { createCollection } = require('./tools/createCollection.js');
const { createNewVoiceChannelAndMoveUser } = require('./voiceCreatorManager/newVoiceChannel.js');
const { deleteVoiceChannel } = require('./voiceCreatorManager/deleteVoiceChannel.js');
const { initCronJobs } = require('./cronJobs/initCronJobs.js');
const pingConfig = require(process.env.DISCORD_BOT_CARD_NOTIFICATION_CONFIG_FILE);

const token = process.env.LOST_ARK_DISCORD_BOT_TOKEN;

// Global var to store which cards have been pinged already
global.recentlyPingedCards = {};
for (const server of pingConfig) {
	global.recentlyPingedCards[server.serverName] =
	{
		lastLostMerchantTimer: '00:00:00',
		pingedCards: [],
	};
}

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMembers,
	],
	rest: {
		rejectOnRateLimit: ['/channels/:id'],
	},
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

	let button = interaction.client.buttonHandlers.get(interaction.customId);

	if (!button) {
		if (interaction.customId.startsWith('special_role_')) {
			button = interaction.client.buttonHandlers.get('special_role');
		} else if (interaction.customId.startsWith('learning_role_')) {
			button = interaction.client.buttonHandlers.get('learning_role');
		} else {
			console.error(`No button matching ${interaction.customId} was found.`);
			return;
		}
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

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
	try {
		if (newState.channelId === process.env.DISCORD_VOICE_CHANNEL_CREATOR_ID) {
			await createNewVoiceChannelAndMoveUser(newState);
		}
		if (oldState.channel && oldState.channel.name.startsWith('Chez ')) {
			const voiceChannel = await oldState.guild.channels.fetch(oldState.channelId);

			if (!(voiceChannel.members && voiceChannel.members.size > 0)) {
				await deleteVoiceChannel(oldState);
			}
		}
	} catch (error) {
		console.error(error);
		logger.logError(oldState.guild, error);
	}

});

// Log in to Discord with your client's token
client.login(token);

initCronJobs(client);