const logger = require ('../tools/logger.js');

async function confirmDeleteRaid(interaction) {
    await interaction.deferUpdate();

    const theOriginalMessageId = await interaction.channel.id;

    await interaction.channel.delete();

    logger.logAction(interaction, `Id: ${theOriginalMessageId} : ${interaction.member.displayName} a supprimé le raid`);
}

module.exports = {
    data: {
        name: 'yesDeleteRaid',
    },
    execute: confirmDeleteRaid,
};