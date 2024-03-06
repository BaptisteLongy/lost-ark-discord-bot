const { RaidRegistrationManager } = require('../tools/RaidRegistrationManager.js');

async function registerBench(interaction) {
    await interaction.deferUpdate();

    const registrationManager = new RaidRegistrationManager(interaction, interaction.message.mentions.channels.size > 0, interaction.channel.isThread ? interaction.channel : undefined);
    registrationManager.registerAs('Banc de touche');
}

module.exports = {
    data: {
        name: 'register_bench',
    },
    execute: registerBench,
};