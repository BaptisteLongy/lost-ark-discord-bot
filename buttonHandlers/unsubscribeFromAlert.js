const logger = require('../tools/logger.js');

async function unsubscribeFromAlert(interaction) {
    await interaction.deferUpdate();
    // Add the member to the thread
    if (interaction.message.hasThread) {
        interaction.message.thread.members.remove(interaction.member.id);
        logger.logAction(interaction, `Id: ${interaction.message.id} : ${interaction.member.displayName} s'est désinscrit de l'alerte`);
    }
}

module.exports = {
    data: {
        name: 'unsubscribe_from_alert',
    },
    execute: unsubscribeFromAlert,
};