const { RaidMessage } = require('../tools/message/RaidMessage.js');
const { CardRunMessage } = require('../tools/message/CardRunMessage.js');
const { LearningMessage } = require('../tools/message/LearningMessage.js');
const logger = require('../tools/logger.js');
const { happensInRaid } = require('../tools/happensInRaid.js');
const { getIDForTag } = require('../tools/getIDForTag.js');

async function registerAsSpecialRole(interaction) {
    if (happensInRaid(interaction)) {
        const cardRunTagId = getIDForTag('card run', interaction.channel.parent.availableTags);
        const learningTagId = getIDForTag('learning', interaction.channel.parent.availableTags);

        await interaction.deferUpdate();

        // Parse the message into a RaidMessage
        let raidMessage;
        if (interaction.channel.appliedTags.find((tag) => { return tag === cardRunTagId; }) !== undefined) {
            raidMessage = new CardRunMessage();
        } else if (interaction.channel.appliedTags.find((tag) => { return tag === learningTagId; }) !== undefined) {
            raidMessage = new LearningMessage();
        } else {
            raidMessage = new RaidMessage();
        }
        raidMessage.initWithEmbed(interaction.message.embeds[0]);

        // Toggle the user in the special role
        raidMessage.toggleSpecialRole(interaction.member, interaction.customId.split('_').pop());

        // Generate the new embed
        const newEmbed = raidMessage.generateEmbed();

        // Send the new embed
        await interaction.editReply({ embeds: [newEmbed] });

        logger.logAction(interaction, `Id: ${interaction.message.id} : ${interaction.member.displayName} s'est ajouté/retiré du role ${raidMessage.raid.specialRoles.find(role => role.value === interaction.customId.split('_').pop()).name}`);
    }
}

module.exports = {
    data: {
        name: 'special_role',
    },
    execute: registerAsSpecialRole,
};