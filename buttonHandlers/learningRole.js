const { happensInRaid } = require('../tools/happensInRaid.js');
const { LearningRegistrationManager } = require('../tools/registrationManagers/LearningRegistrationManager.js');

 async function registerAsLearningRole(interaction) {
    if (happensInRaid(interaction)) {
        await interaction.deferReply({ ephemeral: true });
        const learningRole = interaction.customId.split('_').pop();
        const registrationManager = new LearningRegistrationManager(interaction, false, interaction.channel, learningRole);
        await registrationManager.initRegisterInteraction();
    }
 }

module.exports = {
    data: {
        name: 'learning_role',
    },
    execute: registerAsLearningRole,
};