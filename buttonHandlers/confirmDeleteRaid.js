const logger = require ('../tools/logger.js');

async function confirmDeleteRaid(interaction) {
    await interaction.deferUpdate();

    const theOriginalMessage = await interaction.channel.messages.fetch(interaction.message.reference.messageId);

    // if (theOriginalMessage.hasThread) {
    //     theOriginalMessage.thread.delete();
    // }
    // theOriginalMessage.delete();
    await interaction.channel.delete();

    // await interaction.editReply({ content: 'C\'est fait', components: [] });

    logger.logAction(interaction, `Id: ${theOriginalMessage.id} : ${interaction.member.displayName} a supprimé le raid`);
}

module.exports = {
    data: {
        name: 'yesDeleteRaid',
    },
    execute: confirmDeleteRaid,
};