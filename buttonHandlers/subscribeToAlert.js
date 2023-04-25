const logger = require('../tools/logger.js');

async function subscribeToAlert(interaction) {
    await interaction.deferUpdate();
    // Add the member to the thread
    if (interaction.message.hasThread) {
        interaction.message.thread.members.add(interaction.member);
        logger.logAction(interaction, `Id: ${interaction.message.id} : ${interaction.member.displayName} s'est inscrit à l'alerte`);
    }
}

module.exports = {
    data: {
        name: 'subscribe_to_alert',
    },
    execute: subscribeToAlert,
};