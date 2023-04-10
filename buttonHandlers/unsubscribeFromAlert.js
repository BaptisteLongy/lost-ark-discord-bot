async function unsubscribeFromAlert(interaction) {
    await interaction.deferUpdate();
    // Add the member to the thread
    if (interaction.message.hasThread) {
        interaction.message.thread.members.remove(interaction.member.id);
    }
}

module.exports = {
    data: {
        name: 'unsubscribe_from_alert',
    },
    execute: unsubscribeFromAlert,
};