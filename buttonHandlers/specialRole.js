const { RaidMessage } = require('../tools/message/RaidMessage.js');
const logger = require ('../tools/logger.js');

async function registerAsSpecialRole(interaction) {
    await interaction.deferUpdate();

    // Parse the message into a RaidMessage
    const raidMessage = new RaidMessage();
    raidMessage.initWithEmbed(interaction.message.embeds[0]);

    // Toggle the user in the special role
    raidMessage.toggleSpecialRole(interaction.member, interaction.customId.split('_').pop());

    // Generate the new embed
    const newEmbed = raidMessage.generateEmbed();

    // Send the new embed
    await interaction.editReply({ embeds: [newEmbed] });

    // TO DO ----- Special role à trouver pour logger ----
    logger.logAction(interaction, `Id: ${interaction.message.id} : ${interaction.member.displayName} s'est ajouté/retiré du role ${raidMessage.raid.specialRoles.find(role => role.value === interaction.customId.split('_').pop()).name}`);
}

module.exports = {
    data: {
        name: 'special_role',
    },
    execute: registerAsSpecialRole,
};