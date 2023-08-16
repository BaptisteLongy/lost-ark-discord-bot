const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const baseClassList = require('../tools/baseClasses.json');

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

async function subscribeToRaid(interaction) {
    await interaction.reply({ content: 'Tu viens avec quoi ? (n\'oublie pas de cliquer sur "Cacher le message" une fois que tu as fini)',
                             ephemeral: true, components: [baseClassSelectRow, buttonRow] });
}

module.exports = {
    data: {
        name: 'subscribeToRaid',
    },
    execute: subscribeToRaid,
};