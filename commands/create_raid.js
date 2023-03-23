const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const raids = [
	{ name: 'Valtan NM', value: 'Valtan NM (Normal Mode)' },
	{ name: 'Valtan HM', value: 'Valtan HM (Hard Mode)' },
	{ name: 'Vykas NM', value: 'Vykas NM (Normal Mode)' },
];

const supports = require('../tools/supports.json');
const dps = require('../tools/dps.json');
const classList = [...supports, ...dps].sort((classA, classB) => {
	return classA.value.localeCompare(classB.value);
});

module.exports = {
	data: new SlashCommandBuilder()
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
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();

		const raidEmbed = new EmbedBuilder()
			.setTitle(`${interaction.options.getString('raid')}`)
			.setDescription(`${interaction.options.getString('description')}`);

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
					.setCustomId('delete')
					.setLabel('Supprimer')
					.setStyle(ButtonStyle.Primary),
			);

		await interaction.editReply({ content: `Nouveau raid créé par ${interaction.member}`, embeds: [raidEmbed], components: [selectRow, buttonRow] });
	},
};