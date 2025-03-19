const logger = require('../tools/logger.js');

async function sendAlert(interaction) {
    await interaction.deferUpdate();
    // Add the member to the thread
    if (interaction.message.hasThread) {
        const runTitle = interaction.message.thread.name.split(' - ')[0];
        interaction.message.thread.send(`@everyone ${interaction.member} lance un ${runTitle}`);
        logger.logAction(interaction, `Id: ${interaction.message.id} : ${interaction.member.displayName} active l'alerte`);
    }
}

module.exports = {
    data: {
        name: 'send_alert',
    },
    execute: sendAlert,
};