const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

// inside a command, event listener, etc.

module.exports = {
    data: new SlashCommandBuilder()
        .setName('creer')
        .setDescription('Crée ton propre raid !')
        .addStringOption(option =>
            option.setName('raid')
                .setDescription('Tu pars faire quoi ?')
                .setRequired(true)
                .addChoices(
                    { name: 'Valtan NM', value: 'Valtan NM (Normal Mode)' },
                    { name: 'Valtan HM', value: 'Valtan HM (Hard Mode)' },
                    { name: 'Vykas NM', value: 'Vykas NM (Normal Mode)' },
                ))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Raconte ta vie')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();

        const exampleEmbed = new EmbedBuilder()
            .setTitle(`${interaction.options.getString('raid')}`)
            .setDescription(`${interaction.options.getString('description')}`);

            const selectRow = new ActionRowBuilder()
			.addComponents(
				new StringSelectMenuBuilder()
					.setCustomId('classSelect')
					.setPlaceholder('Tu viens avec quoi ?')
					.addOptions(
						{
							label: 'Bard',
							value: 'bard',
						},
						{
							label: 'Sorceress',
							value: 'sorceress',
						},
						{
							label: 'Flex',
							value: 'flex',
						},
						{
							label: 'Banc de touche',
							value: 'bench',
						},
						{
							label: 'Je viens plus',
							value: 'remove',
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

        await interaction.editReply({ content: `Nouveau raid créé par ${interaction.member}`, embeds: [exampleEmbed], components: [selectRow, buttonRow] });
        // await interaction.deleteReply();
    },
};