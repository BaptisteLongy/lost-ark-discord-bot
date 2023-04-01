const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

async function deleteRaid(interaction) {
    const yesNoButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('yesDeleteRaid')
                .setLabel('Oui je suis sûr !')
                .setStyle(ButtonStyle.Success),
        );
    await interaction.reply({ content: 'Es-tu sûr de vouloir supprimer ce raid ?', ephemeral: true, components: [yesNoButtons] });
}

module.exports = {
    data: {
        name: 'deleteRaid',
    },
    execute: deleteRaid,
};