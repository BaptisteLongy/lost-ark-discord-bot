async function confirmDeleteRaid(interaction) {
    await interaction.deferUpdate();
    interaction.channel.messages.delete(interaction.message.reference.messageId);
    await interaction.editReply({ content: 'C\'est fait', components: [] });
}

module.exports = {
    data: {
        name: 'yesDeleteRaid',
    },
    execute: confirmDeleteRaid,
};