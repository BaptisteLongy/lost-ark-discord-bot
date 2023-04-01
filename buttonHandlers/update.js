const { ActionRowBuilder, ModalBuilder, TextInputStyle, TextInputBuilder } = require('discord.js');

const adminRoleId = process.env.DISCORD_SERVER_ADMIN_ROLE;

async function update(interaction) {
    const adminRole = interaction.member.roles.cache.get(adminRoleId);

    if (adminRole === undefined && interaction.member.toString() !== interaction.message.content.split(' ').pop()) {
        await interaction.reply({ content: 'Oh Bebou... tu peux pas modifier le raid de quelqu\'un d\'autre...', ephemeral: true });
    } else {
        const updateModal = new ModalBuilder()
            .setCustomId('updateModal')
            .setTitle('Modification');

        const newDescriptionInput = new TextInputBuilder()
            .setCustomId('newDescriptionInput')
            .setLabel('Nouvelle description')
            .setStyle(TextInputStyle.Paragraph)
            .setValue(interaction.message.embeds[0].description);

        const newDescriptionRow = new ActionRowBuilder()
            .addComponents(newDescriptionInput);

        updateModal.addComponents(newDescriptionRow);

        await interaction.showModal(updateModal);
    }
}

module.exports = {
    data: {
        name: 'update',
    },
    execute: update,
};