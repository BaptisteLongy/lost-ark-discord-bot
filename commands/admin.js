const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Pour faire des trucs d\'admin. Pour savoir comment l\'utiliser, tape /admin --help')
    .addStringOption(option =>
        option.setName('command')
            .setDescription('commande')
            .setRequired(true));

const helpText = 'Voici la liste des commandes supportées\n  --help : affiche cette aide';

async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const commandParams = interaction.options.getString('command').split(' ');
    switch (commandParams[0]) {
        case '--help':
            await interaction.followUp(helpText);
            return;
        default:
            await interaction.followUp('Désolé, je n\'ai pas compris ta commande. Utilise /admin --help pour plus d\'infos');
            return;
    }
}

module.exports = {
    data: data,
    execute: execute,
};
