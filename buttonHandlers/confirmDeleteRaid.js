const logger = require ('../tools/logger.js');

async function confirmDeleteRaid(interaction) {
    await interaction.deferUpdate();

    const theOriginalMessage = await interaction.channel.messages.fetch(interaction.message.reference.messageId);

    await interaction.channel.delete();

    logger.logAction(interaction, `Id: ${theOriginalMessage.id} : ${interaction.member.displayName} a supprimé le raid`);
}

module.exports = {
    data: {
        name: 'yesDeleteRaid',
    },
    execute: confirmDeleteRaid,
};