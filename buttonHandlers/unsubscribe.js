const { RaidMessage } = require('../tools/RaidMessage.js');
const logger = require ('../tools/logger.js');

async function unsubscribe(interaction) {
    await interaction.deferUpdate();

    // Parse the message into a RaidMessage
    const raidMessage = new RaidMessage();
    raidMessage.initWithEmbed(interaction.message.embeds[0]);

    // Delete the user
    raidMessage.removePlayer(interaction.member);

    // Generate the new embed
    const newEmbed = raidMessage.generateEmbed();

    // Send the new embed
    await interaction.editReply({ embeds: [newEmbed] });

    logger.logAction(interaction, `Id: ${interaction.message.id} : ${interaction.member} s'est désinscrit du raid ${raidMessage.raid.value}`);
}

module.exports = {
    data: {
        name: 'unsubscribe',
    },
    execute: unsubscribe,
};