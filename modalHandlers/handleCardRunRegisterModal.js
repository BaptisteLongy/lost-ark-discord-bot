const { CardRunMessage } = require('../tools/message/CardRunMessage.js');
const logger = require('../tools/logger.js');

async function handleCardRunAvailabilityModal(interaction) {
    // Get the data entered by the user
    const bigDPS = parseInt(interaction.fields.getTextInputValue('bigDPSInput'));
    const smallDPS = parseInt(interaction.fields.getTextInputValue('smallDPSInput'));
    const supports = parseInt(interaction.fields.getTextInputValue('supportsInput'));

    if (isNaN(bigDPS) || isNaN(smallDPS) || isNaN(supports)) {
        await interaction.reply({
            content: 'Désolé, je ne comprends que les nombres',
            ephemeral: true,
        });
    } else {
        // Parse the message into a CardRunMessage
        const raidMessage = new CardRunMessage();
        raidMessage.initWithEmbed(interaction.message.embeds[0]);

        // Add/Change member in card run
        raidMessage.update(interaction.member, bigDPS, smallDPS, supports);

        // Generate the new embed
        const newEmbed = raidMessage.generateEmbed();

        // Send the new embed
        await interaction.update({ embeds: [newEmbed] });

        // Add the member to the thread
        interaction.channel.members.add(interaction.member);

        logger.logAction(interaction, `Id: ${interaction.message.id} : ${interaction.member.displayName} s'est ajouté au card run ${raidMessage.raid.value}`);
    }
}

module.exports = {
    data: {
        name: 'cardRunAvailabilityModal',
    },
    execute: handleCardRunAvailabilityModal,
};