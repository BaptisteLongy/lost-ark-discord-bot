const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const raids = require('../tools/raidList.json');

const supports = require('../tools/supports.json');
const dps = require('../tools/dps.json');
const classList = [...supports, ...dps].sort((classA, classB) => {
	return classA.value.localeCompare(classB.value);
});

const data = new SlashCommandBuilder()
	.setName('creer')
	.setDescription('Crée ton propre raid !')
	.addStringOption(option =>
		option.setName('raid')
			.setDescription('Tu pars faire quoi ?')
			.setRequired(true)
			.addChoices(...raids))
	.addStringOption(option =>
		option.setName('description')
			.setDescription('Raconte ta vie')
			.setRequired(true));

async function execute(interaction) {
	await interaction.deferReply();

	const selectedRaid = raids.find(raid => raid.value === interaction.options.getString('raid'));

	const raidEmbed = new EmbedBuilder()
		.setTitle(selectedRaid.value)
		.setDescription(interaction.options.getString('description'))
		.setColor(selectedRaid.color)
		.setImage(selectedRaid.img);

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

	await interaction.editReply({
		content: `@everyone Nouveau raid créé par ${interaction.member}`,
		embeds: [raidEmbed], components: [selectRow, buttonRow],
	})
	.then(async (message) => {
		await message.startThread({
			name: `${selectedRaid.value} - créé par ${interaction.member.nickname ? interaction.member.nickname : interaction.member.user.username}`,
		});
	});
}

module.exports = {
	data: data,
	execute: execute,
};