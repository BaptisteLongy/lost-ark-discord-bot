const { RaidMessage } = require('../tools/RaidMessage.js');
const logger = require ('../tools/logger.js');

async function handleClassSelect(interaction) {
    await interaction.deferUpdate();

    // Parse the message into a RaidMessage
    const raidMessage = new RaidMessage();
    raidMessage.initWithEmbed(interaction.message.embeds[0]);

    // Update the RaidMessage
    raidMessage.update(interaction.member, interaction.values[0]);

    // Generate the new embed
    const newEmbed = raidMessage.generateEmbed();

    // Send the new embed
    await interaction.editReply({ embeds: [newEmbed] });

    // Add the member to the thread
    if (interaction.message.hasThread) {
        interaction.message.thread.members.add(interaction.member);
    }

    logger.logAction(interaction, `Id: ${interaction.message.id} : ${interaction.member.displayName} s'est ajouté au raid ${raidMessage.raid.value} - Role : ${interaction.values[0]}`);
}

module.exports = {
    data: {
        name: 'classSelect',
    },
    execute: handleClassSelect,
};