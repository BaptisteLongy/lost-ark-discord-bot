const { SlashCommandBuilder } = require('discord.js');

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

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