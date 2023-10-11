const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

async function deleteRaid(interaction) {
    const adminRoleId = process.env.DISCORD_SERVER_ADMIN_ROLE;

    if (!interaction.member.roles.cache.has(adminRoleId) && interaction.member.toString() !== interaction.message.content.split(' ').pop()) {
        await interaction.reply({ content: 'Oh Bebou... tu peux pas supprimer le raid de quelqu\'un d\'autre...', ephemeral: true });
    } else {
        const yesNoButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('yesDeleteRaid')
                    .setLabel('Oui je suis sûr !')
                    .setStyle(ButtonStyle.Success),
            );
        await interaction.reply({ content: 'Es-tu sûr de vouloir supprimer ce raid ?', ephemeral: true, components: [yesNoButtons] });
    }
}

module.exports = {
    data: {
        name: 'deleteRaid',
    },
    execute: deleteRaid,
};