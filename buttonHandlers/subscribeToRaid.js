const { RaidRegistrationManager } = require('../tools/RaidRegistrationManager.js');
const { happensInRaid } = require('../tools/happensInRaid.js');

async function subscribeToRaid(interaction) {
    if (happensInRaid(interaction)) {
        const registrationManager = new RaidRegistrationManager(interaction, false, interaction.channel);
        await registrationManager.initRegisterInteraction();
    }
}

module.exports = {
    data: {
        name: 'subscribeToRaid',
    },
    execute: subscribeToRaid,
};