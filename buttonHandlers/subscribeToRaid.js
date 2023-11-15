const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const baseClassList = require('../tools/baseClasses.json');
const { happensInRaid } = require('../tools/happensInRaid.js');
const { getIDForTag } = require('../tools/getIDForTag.js');

const baseClassSelectRow = new ActionRowBuilder()
    .addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('baseClassSelect')
            .setPlaceholder('Archetype')
            .addOptions(...baseClassList),
    );

const buttonRow = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('register_flex')
            .setLabel('Flex')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('register_bench')
            .setLabel('Banc de touche')
            .setStyle(ButtonStyle.Primary),
    );

function generateCardRunAvailabilityModal() {
    const cardRunAvailabilityModal = new ModalBuilder()
        .setCustomId('cardRunAvailabilityModal')
        .setTitle('Il ressemble à quoi ton roster ?');

    const bigDPSInput = new TextInputBuilder()
        .setCustomId('bigDPSInput')
        .setLabel('Combien de gros DPS ?')
        .setStyle(TextInputStyle.Short)
        .setValue('0');

    const smallDPSInput = new TextInputBuilder()
        .setCustomId('smallDPSInput')
        .setLabel('Combien de petits DPS ?')
        .setStyle(TextInputStyle.Short)
        .setValue('0');

    const supportInput = new TextInputBuilder()
        .setCustomId('supportInput')
        .setLabel('Combien de supports ?')
        .setStyle(TextInputStyle.Short)
        .setValue('0');

    const bigDPSRow = new ActionRowBuilder()
        .addComponents([bigDPSInput]);

    const smallDPSRow = new ActionRowBuilder()
        .addComponents([smallDPSInput]);

    const supportRow = new ActionRowBuilder()
        .addComponents([supportInput]);

    cardRunAvailabilityModal.addComponents([bigDPSRow, smallDPSRow, supportRow]);

    return cardRunAvailabilityModal;
}

async function subscribeToRaid(interaction) {
    if (happensInRaid(interaction)) {
        const cardRunTagId = getIDForTag('card run', interaction.channel.parent.availableTags);

        if (interaction.channel.appliedTags.find((tag) => { return tag === cardRunTagId; }) === undefined) {
            await interaction.reply({
                content: 'Tu viens avec quoi ? (n\'oublie pas de cliquer sur "Cacher le message" une fois que tu as fini)',
                ephemeral: true, components: [baseClassSelectRow, buttonRow],
            });
        } else {
            await interaction.showModal(generateCardRunAvailabilityModal());
        }
    }
}

module.exports = {
    data: {
        name: 'subscribeToRaid',
    },
    execute: subscribeToRaid,
};