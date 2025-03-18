const { RaidRegistrationManager } = require('../tools/registrationManagers/RaidRegistrationManager.js');
const { happensInRaid } = require('../tools/happensInRaid.js');

async function subscribeToRaid(interaction) {
    if (happensInRaid(interaction)) {
        await interaction.deferReply({ ephemeral: true });
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