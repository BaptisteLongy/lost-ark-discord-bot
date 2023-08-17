const { RaidMessage } = require('../tools/RaidMessage.js');
const logger = require('../tools/logger.js');
const { getRandomInt } = require('../tools/getRandomInt.js');

function diceForList(memberList, thread, introMessage) {
    thread.send({
        content: introMessage,
    });
    memberList.forEach(member => {
        thread.send({
            content: `${member.player} fait un **${getRandomInt(100)}**`,
        });
    });
}

async function diceForAll(interaction) {
    await interaction.deferUpdate();

    // Parse the message into a RaidMessage
    const raidMessage = new RaidMessage();

    raidMessage.initWithEmbed(interaction.message.embeds[0]);

    if (interaction.message.hasThread) {
        if (Array.isArray(raidMessage.supports) && raidMessage.supports.length > 0) {
            diceForList(raidMessage.supports, interaction.message.thread, '**Les supports en premier**');
        }
        if (Array.isArray(raidMessage.dps) && raidMessage.dps.length > 0) {
            diceForList(raidMessage.dps, interaction.message.thread, '**De la chance chez les DPS ?**');
        }
        if (Array.isArray(raidMessage.flex) && raidMessage.flex.length > 0) {
            diceForList(raidMessage.flex, interaction.message.thread, '**Des flex peut-être**');
        }
        if (Array.isArray(raidMessage.bench) && raidMessage.bench.length > 0) {
            diceForList(raidMessage.bench, interaction.message.thread, '**Au tour du banc de touche**');
        }
    }

    logger.logAction(interaction, `Id: ${interaction.message.id} : ${interaction.member.displayName} lance les dés pour tout le monde`);
}

module.exports = {
    data: {
        name: 'dice_for_all',
    },
    execute: diceForAll,
};