const { LearningRegistrationManager } = require('../tools/registrationManagers/LearningRegistrationManager.js');
const { RaidRegistrationManager } = require('../tools/registrationManagers/RaidRegistrationManager.js');

async function handleBaseClassSelect(interaction) {
    await interaction.deferUpdate();

    const customIdSplit = interaction.customId.split('_');
    const raidType = customIdSplit.pop();

    let registrationManager;
    if (raidType === 'learning') {
        registrationManager = new LearningRegistrationManager(interaction, interaction.message.mentions.channels.size > 0, interaction.channel.isThread ? interaction.channel : undefined, customIdSplit.pop());
    } else {
        registrationManager = new RaidRegistrationManager(interaction, interaction.message.mentions.channels.size > 0, interaction.channel.isThread ? interaction.channel : undefined);
    }

    registrationManager.updateRegistrationOnBaseClassPick();
}

module.exports = {
    data: {
        name: 'baseClassSelect',
    },
    execute: handleBaseClassSelect,
};