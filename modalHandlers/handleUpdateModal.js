const { RaidMessage } = require('../tools/RaidMessage.js');

async function handleUpdateModal(interaction) {
    // Get the data entered by the user
	const newDescription = interaction.fields.getTextInputValue('newDescriptionInput');

    // Parse the message into a RaidMessage
    const raidMessage = new RaidMessage(interaction.message.embeds[0]);

    // Change Raid description
    raidMessage.changeDescription(newDescription);

    // Generate the new embed
    const newEmbed = raidMessage.generateEmbed();

    // Send the new embed
    await interaction.update({ embeds: [newEmbed] });
}

module.exports = {
    handleUpdateModal,
};