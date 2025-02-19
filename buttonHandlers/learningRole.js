const { happensInRaid } = require('../tools/happensInRaid.js');
const { LearningMessage } = require('../tools/message/LearningMessage.js');
const logger = require('../tools/logger.js');

async function registerAsLearningRole(interaction) {
    if (happensInRaid(interaction)) {
        await interaction.deferUpdate();

        const raidMessage = new LearningMessage;
        raidMessage.initWithEmbed(interaction.message.embeds[0]);

        // Toggle the user in the learning role
        raidMessage.toggleLearningRole(interaction.member, interaction.customId.split('_').pop());

        // Generate the new embed
        const newEmbed = raidMessage.generateEmbed();

        // Send the new embed
        await interaction.editReply({ embeds: [newEmbed] });

        // Proper role to find
        logger.logAction(interaction, `Id: ${interaction.message.id} : ${interaction.member.displayName} s'est ajouté/retiré du role ${interaction.customId.split('_').pop()}`);
    }
}

module.exports = {
    data: {
        name: 'learning_role',
    },
    execute: registerAsLearningRole,
};