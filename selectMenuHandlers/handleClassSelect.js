const { RaidMessage } = require('../tools/RaidMessage.js');

async function handleClassSelect(interaction) {
    await interaction.deferUpdate();

    // Parse the message into a RaidMessage
    const raidMessage = new RaidMessage(interaction.message.embeds[0]);

    // Update the RaidMessage
    raidMessage.update(interaction.member, interaction.values[0]);

    // Generate the new embed
    const newEmbed = raidMessage.generateEmbed();

    // Send the new embed
    await interaction.editReply({ embeds: [newEmbed] });
}

module.exports = {
    name: 'classSelect',
    execute: handleClassSelect,
};