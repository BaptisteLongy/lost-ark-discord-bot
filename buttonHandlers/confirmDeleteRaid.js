async function confirmDeleteRaid(interaction) {
    await interaction.deferUpdate();

    const theOriginalMessage = await interaction.channel.messages.fetch(interaction.message.reference.messageId);

    if (theOriginalMessage.hasThread) {
        theOriginalMessage.thread.delete();
    }
    theOriginalMessage.delete();

    await interaction.editReply({ content: 'C\'est fait', components: [] });
}

module.exports = {
    data: {
        name: 'yesDeleteRaid',
    },
    execute: confirmDeleteRaid,
};