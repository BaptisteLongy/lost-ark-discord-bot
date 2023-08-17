const { SlashCommandBuilder } = require('discord.js');
const { getRandomInt } = require('../tools/getRandomInt.js');

const data = new SlashCommandBuilder()
    .setName('dé')
    .setDescription('Lance un D100');

async function execute(interaction) {
        await interaction.reply({
            content: `${interaction.member} fait un **${getRandomInt(100)}**`,
        });
}

module.exports = {
    data: data,
    execute: execute,
};