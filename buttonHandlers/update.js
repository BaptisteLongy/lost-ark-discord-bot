const { ActionRowBuilder, ModalBuilder, TextInputStyle, TextInputBuilder } = require('discord.js');

async function update(interaction) {
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

module.exports = {
    data: {
        name: 'update',
    },
    execute: update,
};