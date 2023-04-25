const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const { RaidMessage } = require('../tools/RaidMessage.js');
const raids = require('../tools/raidList.json');
const supports = require('../tools/supports.json');
const dps = require('../tools/dps.json');
const logger = require ('../tools/logger.js');
const classList = [...supports, ...dps].sort((classA, classB) => {
	return classA.value.localeCompare(classB.value);
});

const data = new SlashCommandBuilder()
	.setName('creer')
	.setDescription('Crée ton propre raid !');

raids.forEach(raid => {
	data.addSubcommand(raidCommand => {
		raidCommand
			.setName(raid.name.toLowerCase())
			.setDescription(raid.value);
		if (Array.isArray(raid.modes)) {
			raidCommand.addStringOption(option =>
				option.setName('mode')
					.setDescription('Quel mode ?')
					.setRequired(true)
					.addChoices(...raid.modes));
		}
		raidCommand.addStringOption(option =>
			option.setName('gate')
				.setDescription('Quelle gate ? Sert aussi de complément de titre si tu fais un raid "Autre"')
				.setRequired(true))
			.addStringOption(option =>
				option.setName('description')
					.setDescription('Raconte ta vie')
					.setRequired(true));
		return raidCommand;
	});
});

const selectRow = new ActionRowBuilder()
	.addComponents(
		new StringSelectMenuBuilder()
			.setCustomId('classSelect')
			.setPlaceholder('Tu viens avec quoi ?')
			.addOptions(
				...classList,
				{
					label: 'Flex',
					value: 'Flex',
				},
				{
					label: 'Banc de touche',
					value: 'Banc de touche',
				},
			),
	);

const buttonRow = new ActionRowBuilder()
	.addComponents(
		new ButtonBuilder()
			.setCustomId('unsubscribe')
			.setLabel('Se désinscrire')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('warn')
			.setLabel('On part !')
			.setStyle(ButtonStyle.Success),
		new ButtonBuilder()
			.setCustomId('update')
			.setLabel('Modifier')
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId('deleteRaid')
			.setLabel('Supprimer le raid')
			.setStyle(ButtonStyle.Danger),
	);

async function execute(interaction) {
	const raidMessage = new RaidMessage();
	const chosenRaid = raids.find(raid => raid.name === interaction.options.getSubcommand());
	raidMessage.raid = chosenRaid;
	if (Array.isArray(chosenRaid.modes)) {
		raidMessage.mode = interaction.options.getString('mode');
	}
	raidMessage.gate = interaction.options.getString('gate');
	raidMessage.description = interaction.options.getString('description');

	const raidEmbed = raidMessage.generateEmbed();
	let messageId;

	await interaction.reply({
		content: `@everyone Nouveau raid créé par ${interaction.member}`,
		embeds: [raidEmbed], components: [selectRow, buttonRow],
		allowedMentions: { parse:['everyone'] },
	})
		.then(async (response) => {
			const message = await response.fetch();
			messageId = message.id;
			let raidName = '';
			if (interaction.options.getString('mode')) {
				raidName = `${chosenRaid.value} ${raidMessage.mode}`;
			} else {
				raidName = chosenRaid.value;
			}
			await message.startThread({
				name: `${raidName} - ${interaction.options.getString('gate')} créé par ${interaction.member.displayName}`,
			});
		});
	logger.logAction(interaction, `Id: ${messageId} : ${interaction.member.displayName} a créé un raid ${raidMessage.raid.value} dans le channel ${interaction.channel}`);
}

module.exports = {
	data: data,
	execute: execute,
};