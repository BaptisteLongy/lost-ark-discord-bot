const { RaidRegistrationManager } = require('../tools/RaidRegistrationManager.js');


async function handleClassSelect(interaction) {
    await interaction.deferUpdate();

    const registrationManager = new RaidRegistrationManager(interaction, interaction.message.mentions.channels.size > 0, interaction.channel.isThread ? interaction.channel : undefined);
    registrationManager.registerAs(interaction.values[0]);
}

module.exports = {
    data: {
        name: 'classSelect',
    },
    execute: handleClassSelect,
};