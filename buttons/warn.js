const { RaidMessage } = require('../tools/RaidMessage.js');

function reduceForMessage(previous, current) {
    return previous === '' ? current.player : `${previous} ${current.player}`;
}

async function warn(interaction) {
    await interaction.deferUpdate();

    const raidMessage = new RaidMessage(interaction.message.embeds[0]);

    const warnSupportMessage = raidMessage.supports.reduce(reduceForMessage, '');
    const warnDPSMessage = raidMessage.dps.reduce(reduceForMessage, '');
    const warnFlexMessage = raidMessage.flex.reduce(reduceForMessage, '');
    let warnMessage = warnSupportMessage;
    warnMessage === '' ? warnMessage = warnDPSMessage : warnMessage = `${warnMessage} ${warnDPSMessage}`;
    warnMessage === '' ? warnMessage = warnFlexMessage : warnMessage = `${warnMessage} ${warnFlexMessage}`;

    if (warnMessage !== '') {
        await interaction.message.reply(warnMessage + 'ça part !!!');
    }

    const benchMessage = raidMessage.bench.reduce(reduceForMessage, '');

    if (benchMessage !== '') {
        await interaction.message.reply(benchMessage + ' on se prépare sur le banc des remplaçants...');
    }
}

module.exports = {
    warn,
};