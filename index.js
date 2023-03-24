const dotenv = require('dotenv');
dotenv.config();

// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const { RaidMessage } = require('./tools/RaidMessage.js');
const { unsubscribe } = require('./buttons/unsubscribe.js');
const { deleteRaid } = require('./buttons/deleteRaid.js');
const { confirmDeleteRaid } = require('./buttons/confirmDeleteRaid.js');

// For when I'll reinstate roster sniffer eventually
// Google Vision
// const vision = require('@google-cloud/vision');
// const vision_client = new vision.ImageAnnotatorClient();

// const { token } = require('./config.json');
const token = process.env.LOST_ARK_DISCORD_BOT_TOKEN;

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

client.commands = new Collection();

// Build the commands Collection for easy access
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

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

	if (interaction.customId === 'classSelect') {
		await interaction.deferUpdate();

		// Parse the message into a RaidMessage
		const raidMessage = new RaidMessage(interaction.message.embeds[0]);

		// Update the RaidMessage
		raidMessage.update(interaction.member, interaction.values[0]);

		// Generate the new embed
		const newEmbed = raidMessage.generateEmbed();

		// Send the new embed
		await interaction.editReply({ embeds: [newEmbed] });
	}
});

// Buttons listener
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isButton()) return;

	try {
		if (interaction.customId === 'unsubscribe') {
			await unsubscribe(interaction);
		}
		if (interaction.customId === 'deleteRaid') {
			await deleteRaid(interaction);
		}
		if (interaction.customId === 'yesDeleteRaid') {
			await confirmDeleteRaid(interaction);
		}
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
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