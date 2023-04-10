async function subscribeToAlert(interaction) {
    await interaction.deferUpdate();
    // Add the member to the thread
    if (interaction.message.hasThread) {
        interaction.message.thread.members.add(interaction.member);
    }
}

module.exports = {
    data: {
        name: 'subscribe_to_alert',
    },
    execute: subscribeToAlert,
};