const { RaidRegistrationManager } = require('../tools/RaidRegistrationManager.js');

async function handleBaseClassSelect(interaction) {
    await interaction.deferUpdate();

    const registrationManager = new RaidRegistrationManager(interaction, undefined, undefined);
    registrationManager.updateRegistrationOnBaseClassPick();
}

module.exports = {
    data: {
        name: 'baseClassSelect',
    },
    execute: handleBaseClassSelect,
};