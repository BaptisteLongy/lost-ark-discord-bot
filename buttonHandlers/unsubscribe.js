const { RaidMessage } = require('../tools/RaidMessage.js');

async function unsubscribe(interaction) {
    await interaction.deferUpdate();

    // Parse the message into a RaidMessage
    const raidMessage = new RaidMessage(interaction.message.embeds[0]);

    // Delete the user
    raidMessage.removePlayer(interaction.member);

    // Generate the new embed
    const newEmbed = raidMessage.generateEmbed();

    // Send the new embed
    await interaction.editReply({ embeds: [newEmbed] });
}

module.exports = {
    data: {
        name: 'unsubscribe',
    },
    execute: unsubscribe,
};