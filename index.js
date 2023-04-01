const dotenv = require('dotenv');
dotenv.config();

// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { createCollection } = require('./tools/createCollection.js');

// For when I'll reinstate roster sniffer eventually
// Google Vision
// const vision = require('@google-cloud/vision');
// const vision_client = new vision.ImageAnnotatorClient();

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
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this modal!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this modal!', ephemeral: true });
		}
	}
});

// For when I'll reinstate roster sniffer eventually
// client.on('messageCreate', async (message) => {
//     if (message.author.bot) return;

//     if (message.channel.id === '895331467519983698') {
//         // run code here
//         console.log('Message detected');
//         // message.attachments[0].value.attachment
//         const attachment = message.attachments.at(0)
//         const [result] = await vision_client.textDetection(attachment.attachment);
//         const detections = result.textAnnotations;
//         // console.log('Text:');
//         const detectionsArray = detections[0].description.split('\n');
//         // debugger

//         const allCharacters = [];

//         while (detectionsArray.length > 0) {
//             const workingArray = [];

//             // Init
//             workingArray.push(detectionsArray.shift());
//             workingArray.push(detectionsArray.shift());
//             workingArray.push(detectionsArray.shift());

//             try {
//                 while (workingArray[workingArray.length - 1] && !workingArray[workingArray.length - 1].includes('N. ')) {
//                     workingArray.shift();
//                     workingArray.push(detectionsArray.shift());
//                 }
//             }
//             catch (e) {
//                 debugger
//             }

//             if (workingArray[2] && workingArray[2].includes('N. ')) {
//                 const currentCharacter = {
//                     class: workingArray[0],
//                     name: workingArray[1],
//                     ilvl: workingArray[2].substring(workingArray[2].lastIndexOf(' ') + 1),
//                 };


//                 allCharacters.push(currentCharacter);
//             }
//         }
//         // debugger

//         message.channel.send(`Liste des persos de ${message.author.username}`);
//         allCharacters.forEach(character => {
//             message.channel.send(`Nom : ${character.name} - Classe : ${character.class} - Item Level : ${character.ilvl}`)
//         })

//         // detections.forEach(text => console.log(text));
//     }
// });

// Log in to Discord with your client's token
client.login(token);