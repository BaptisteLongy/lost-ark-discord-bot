const { RaidMessage } = require('../tools/message/RaidMessage.js');
const logger = require ('../tools/logger.js');

async function registerBench(interaction) {
    await interaction.deferUpdate();

    // Parse the message into a RaidMessage
    const raidMessage = new RaidMessage();

    const initialMessage = await interaction.message.fetchReference();

    raidMessage.initWithEmbed(initialMessage.embeds[0]);

    // Update the RaidMessage
    raidMessage.update(interaction.member, 'Banc de touche');

    // Generate the new embed
    const newEmbed = raidMessage.generateEmbed();

    // Send the new embed
    await initialMessage.edit({ embeds: [newEmbed] });

    // Add the member to the thread
    initialMessage.channel.members.add(interaction.member);

    await interaction.editReply({ content: '**Tu es ajouté sur le banc de touche !**\nTu peux encore changer bien sûr' });

    logger.logAction(interaction, `Id: ${initialMessage.id} : ${interaction.member.displayName} s'est ajouté au raid ${raidMessage.raid.value} - Role : Banc de touche`);
}

module.exports = {
    data: {
        name: 'register_bench',
    },
    execute: registerBench,
};