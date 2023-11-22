const { RaidMessage } = require('../tools/message/RaidMessage.js');
const { CardRunMessage } = require('../tools/message/CardRunMessage.js');
const logger = require('../tools/logger.js');
const { getIDForTag } = require('../tools/getIDForTag.js');

async function handleUpdateModal(interaction) {
    // Get the data entered by the user
    const newDescription = interaction.fields.getTextInputValue('newDescriptionInput');

    // Parse the message into a RaidMessage
    const cardRunTagId = getIDForTag('card run', interaction.channel.parent.availableTags);
    let raidMessage;
    if (interaction.channel.appliedTags.find((tag) => { return tag === cardRunTagId; }) === undefined) {
        raidMessage = new RaidMessage();
    } else {
        raidMessage = new CardRunMessage();
    }
    raidMessage.initWithEmbed(interaction.message.embeds[0]);

    // Change Raid description
    raidMessage.changeDescription(newDescription);

    // Generate the new embed
    const newEmbed = raidMessage.generateEmbed();

    // Send the new embed
    await interaction.update({ embeds: [newEmbed] });

    logger.logAction(interaction, `Id: ${interaction.message.id} : ${interaction.member.displayName} a modifié le raid ${raidMessage.raid.value}`);
}

module.exports = {
    data: {
        name: 'updateModal',
    },
    execute: handleUpdateModal,
};