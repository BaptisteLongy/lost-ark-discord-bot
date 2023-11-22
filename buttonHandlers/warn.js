const { RaidMessage } = require('../tools/message/RaidMessage.js');
const { CardRunMessage } = require('../tools/message/CardRunMessage.js');
const logger = require('../tools/logger.js');
const { happensInRaid } = require('../tools/happensInRaid.js');
const { getIDForTag } = require('../tools/getIDForTag.js');

async function warn(interaction) {
    if (happensInRaid(interaction)) {
        const cardRunTagId = getIDForTag('card run', interaction.channel.parent.availableTags);

        await interaction.deferUpdate();

        // Parse the message into a RaidMessage
        let raidMessage;
        if (interaction.channel.appliedTags.find((tag) => { return tag === cardRunTagId; }) === undefined) {
            raidMessage = new RaidMessage();
        } else {
            raidMessage = new CardRunMessage();
        }

        raidMessage.initWithEmbed(interaction.message.embeds[0]);

        await raidMessage.warn(interaction);

        logger.logAction(interaction, `Id: ${interaction.message.id} : ${interaction.member.displayName} lance le raid ${raidMessage.raid.value}`);
    }
}

module.exports = {
    data: {
        name: 'warn',
    },
    execute: warn,
};