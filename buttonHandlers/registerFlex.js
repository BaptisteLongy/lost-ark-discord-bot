const { RaidRegistrationManager } = require('../tools/RaidRegistrationManager.js');

async function registerFlex(interaction) {
    await interaction.deferUpdate();

    const registrationManager = new RaidRegistrationManager(interaction, interaction.message.mentions.channels.size > 0, interaction.channel.isThread ? interaction.channel : undefined);
    registrationManager.registerAs('Flex');
}

module.exports = {
    data: {
        name: 'register_flex',
    },
    execute: registerFlex,
};