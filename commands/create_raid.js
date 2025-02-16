const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const { RaidMessage } = require('../tools/message/RaidMessage.js');
const { CardRunMessage } = require('../tools/message/CardRunMessage.js');
const raids = require('../tools/raidList.json');
const days = require('../tools/days.json');
const logger = require('../tools/logger.js');
const rairTypes = require('../tools/raidTypes.json');
const { getIDForTag } = require('../tools/getIDForTag.js');
const { RaidRegistrationManager } = require('../tools/RaidRegistrationManager.js');

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
			.addStringOption(option =>
				option.setName('type')
					.setDescription('Plutôt learning ou card run ?')
					.setRequired(true)
					.addChoices(...rairTypes))
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

async function sendMessageIfLearning(thread, type) {
	if (type === 'learning' || type === 'progress') {
		const learningMessage = '**Rappels pour un bon learning**\n- Proportions idéales du groupe : 1 learner pour 3 vétérans\n- Chaque learner doit avoir lu/vu un guide\n- Ne pas hésiter à passer en vocal pour demander la participation des vétérans';
		thread.send(learningMessage);
	}
}

async function execute(interaction) {
	await interaction.deferReply({ ephemeral: true });

	let raidMessage;
	const raidType = interaction.options.getString('type');
	if (raidType === 'card run') {
		raidMessage = new CardRunMessage();
	} else {
		raidMessage = new RaidMessage();
	}
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

	raidMessage.setDay(interaction.options.getString('jour'));
	raidMessage.setTime(interaction.options.getString('heure'));

	const threadName = raidMessage.generateForumThreadTitle();
	const tags = [
		getIDForTag(await interaction.options.getString('jour'), forum.availableTags),
		getIDForTag(chosenRaid.otherTag ? 'autre' : chosenRaid.name, forum.availableTags),
		getIDForTag(raidType, forum.availableTags),
	];

	await forum.threads.create(
		{
			name: threadName,
			message: {
				content: `Nouveau raid créé par ${interaction.member}`,
				embeds: [raidEmbed], components: components,
				allowedMentions: { parse: ['everyone', 'roles'] },
			},
			appliedTags: tags,
		},
	).then(async (response) => {
		const message = await response.fetch();
		const messageId = message.id;
		logger.logAction(interaction, `Id: ${messageId} : ${interaction.member.displayName} a créé un raid ${raidMessage.raid.value} - Nom : ${threadName}`);

		await sendMessageIfLearning(message, raidType);

		const registrationManager = new RaidRegistrationManager(interaction, true, response);
		registrationManager.initCreationInteraction();
	});
}

module.exports = {
	data: data,
	execute: execute,
};