const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const { RaidMessage } = require('../tools/RaidMessage.js');
const raids = require('../tools/raidList.json');
const days = require('../tools/days.json');
const logger = require('../tools/logger.js');

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
				option.setName('jour')
					.setDescription('Jour')
					.setRequired(true)
					.addChoices(...days))
			.addStringOption(option =>
				option.setName('heure')
					.setDescription('Heure')
					.setRequired(true))
			.addBooleanOption(option =>
				option.setName('learning')
					.setDescription('Si tu crées une pearning party')
					.setRequired(true))
			.addStringOption(option =>
				option.setName('description')
					.setDescription('Raconte ta vie')
					.setRequired(true));
		return raidCommand;
	});
});

const firstButtonRow = new ActionRowBuilder()
	.addComponents(
		new ButtonBuilder()
			.setCustomId('subscribeToRaid')
			.setLabel('Je viens/Je change')
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId('unsubscribe')
			.setLabel('Se désinscrire')
			.setStyle(ButtonStyle.Secondary),
	);

const secondButtonRow = new ActionRowBuilder()
	.addComponents(
		new ButtonBuilder()
			.setCustomId('warn')
			.setLabel('On part !')
			.setStyle(ButtonStyle.Success),
		new ButtonBuilder()
			.setCustomId('dice_for_all')
			.setLabel('Un dé pour tous')
			.setStyle(ButtonStyle.Danger),
	);

const thirdButtonRow = new ActionRowBuilder()
	.addComponents(
		new ButtonBuilder()
			.setCustomId('update')
			.setLabel('Modifier le raid')
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId('deleteRaid')
			.setLabel('Supprimer le raid')
			.setStyle(ButtonStyle.Danger),
	);

async function getIDForTag(tagName, tagList) {
	return tagList.find(tag => tag.name === tagName).id;
}

async function execute(interaction) {
	await interaction.deferReply({ ephemeral: true });

	const raidMessage = new RaidMessage();
	const chosenRaid = raids.find(raid => raid.name === interaction.options.getSubcommand());

	const components = [
		firstButtonRow,
		secondButtonRow,
		thirdButtonRow,
	];

	if (chosenRaid.specialRoles !== undefined) {
		const fourthButtonRow = new ActionRowBuilder();
		for (const role of chosenRaid.specialRoles) {
			fourthButtonRow.addComponents(
				new ButtonBuilder()
					.setCustomId(`special_role_${role.value}`)
					.setLabel(role.name)
					.setStyle(ButtonStyle.Danger),
			);
		}
		components.push(fourthButtonRow);
	}

	raidMessage.raid = chosenRaid;
	if (Array.isArray(chosenRaid.modes)) {
		raidMessage.mode = interaction.options.getString('mode');
	}
	raidMessage.gate = interaction.options.getString('gate');
	raidMessage.description = interaction.options.getString('description');

	const raidEmbed = raidMessage.generateEmbed();

	const forum = interaction.client.channels.cache.get(process.env.DISCORD_RAID_FORUM_CHANNEL);
	const threadName = raidMessage.generateForumThreadTitle(interaction.options.getString('jour'), interaction.options.getString('heure'));
	const tags = [
		await getIDForTag(interaction.options.getString('jour'), forum.availableTags),
		await getIDForTag(chosenRaid.name, forum.availableTags),
	];

	if (interaction.options.getBoolean('learning')) {
		tags.push(await getIDForTag('learning', forum.availableTags));
	}

	await forum.threads.create(
		{
			name: threadName,
			message: {
				content: `Nouveau raid créé par ${interaction.member}`,
				embeds: [raidEmbed], components: components,
				allowedMentions: { parse: ['everyone'] },
			},
			appliedTags: tags,
		},
	).then(async (response) => {
		const message = await response.fetch();
		const messageId = message.id;
		logger.logAction(interaction, `Id: ${messageId} : ${interaction.member.displayName} a créé un raid ${raidMessage.raid.value} - Nom : ${threadName}`);
		await interaction.followUp('C\'est fait !');
	});
}

module.exports = {
	data: data,
	execute: execute,
};