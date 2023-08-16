const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const baseClassList = require('../tools/baseClasses.json');
const supports = require('../tools/supports.json');
const dps = require('../tools/dps.json');

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

function generateSelectMenuForBaseClass(baseClass) {
    const selectOptions = [...supports, ...dps].filter(uniqueClass => uniqueClass.baseClass === baseClass.label)
    .sort((classA, classB) => {
        return classA.value.localeCompare(classB.value);
    });

    return new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('classSelect')
                .setPlaceholder(baseClass.label)
                .addOptions(...selectOptions),
        );
}

async function handleBaseClassSelect(interaction) {
    await interaction.deferUpdate();

    const baseClass = baseClassList.find(baseClassTemp => baseClassTemp.value === interaction.values[0]);

    const classSelectRow = generateSelectMenuForBaseClass(baseClass);

    // Send the new embed
    await interaction.editReply({ components: [baseClassSelectRow, classSelectRow, buttonRow] });

}

module.exports = {
    data: {
        name: 'baseClassSelect',
    },
    execute: handleBaseClassSelect,
};