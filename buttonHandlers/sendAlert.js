async function sendAlert(interaction) {
    await interaction.deferUpdate();
    // Add the member to the thread
    if (interaction.message.hasThread) {
        const runTitle = interaction.message.thread.name.split(' - ')[0];
        interaction.message.thread.send(`@here ${interaction.member} lance un ${runTitle}`);
    }
}

module.exports = {
    data: {
        name: 'send_alert',
    },
    execute: sendAlert,
};