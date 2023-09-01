const { RaidMessage } = require('../tools/RaidMessage.js');
const logger = require ('../tools/logger.js');

function reduceForMessage(previous, current) {
    return previous === '' ? current.player : `${previous} ${current.player}`;
}

async function warn(interaction) {
    await interaction.deferUpdate();

    const raidMessage = new RaidMessage();
    raidMessage.initWithEmbed(interaction.message.embeds[0]);

    const warnSupportMessage = raidMessage.supports.reduce(reduceForMessage, '');
    const warnDPSMessage = raidMessage.dps.reduce(reduceForMessage, '');
    const warnFlexMessage = raidMessage.flex.reduce(reduceForMessage, '');
    let warnMessage = warnSupportMessage;
    warnMessage === '' ? warnMessage = warnDPSMessage : warnMessage = `${warnMessage} ${warnDPSMessage}`;
    warnMessage === '' ? warnMessage = warnFlexMessage : warnMessage = `${warnMessage} ${warnFlexMessage}`;

    if (warnMessage !== '') {
        // if (interaction.message.hasThread) {
        //     interaction.message.thread.send(warnMessage + 'ça part !!!');
        // } else {
        //     await interaction.message.reply(warnMessage + 'ça part !!!');
        // }
        await interaction.channel.send(warnMessage + 'ça part !!!');
    }

    const benchMessage = raidMessage.bench.reduce(reduceForMessage, '');

    if (benchMessage !== '') {
        // if (interaction.message.hasThread) {
        //     interaction.message.thread.send(benchMessage + ' on se prépare sur le banc des remplaçants...');
        // } else {
        //     await interaction.message.reply(benchMessage + ' on se prépare sur le banc des remplaçants...');
        // }
        await interaction.channel.send(benchMessage + ' on se prépare sur le banc des remplaçants...');
    }

    logger.logAction(interaction, `Id: ${interaction.message.id} : ${interaction.member.displayName} lance le raid ${raidMessage.raid.value}`);
}

module.exports = {
    data: {
        name: 'warn',
    },
    execute: warn,
};