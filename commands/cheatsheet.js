const { SlashCommandBuilder } = require('discord.js');

const gates = require('../tools/gates.json');
const raids = require('../tools/raidList.json');
const logger = require ('../tools/logger.js');

const data = new SlashCommandBuilder()
    .setName('cheatsheet')
    .setDescription('Récupère la cheatsheet d\'une gate du raid')
    .addStringOption(option =>
        option.setName('gate')
            .setDescription('Gate')
            .setRequired(true)
            .addChoices(...gates));

async function execute(interaction) {
    if (interaction.channel.parentId === process.env.DISCORD_RAID_FORUM_CHANNEL) {
        const gate = interaction.options.getString('gate');
        const raid = raids.find(theRaid => theRaid.value === interaction.channel.name.split(' ')[0]);
        if (raid[gate] !== undefined) {
            await interaction.reply(raid[gate].cheatsheet);
            await interaction.channel.messages.fetch();
            logger.logAction(interaction, `Id: ${interaction.channel.id} : ${interaction.member.displayName} a demandé la cheatsheet pour la ${gate}`);
        } else {
            await interaction.reply({ content: `Désolé, je n'ai pas de cheatsheet pour la ${gate}.\nSi c'est un oubli, laisse un message à Bugs ;)`, ephemeral: true });
            logger.logAction(interaction, `Id: ${interaction.channel.id} : ${interaction.member.displayName} a demandé la cheatsheet pour la ${gate}, mais la cheatsheet n'existe pas`);
        }
    } else {
        await interaction.reply({ content: 'Désolé, cette commande ne s\'utilise que dans le thread d\'un raid', ephemeral: true });
        logger.logAction(interaction, `Warning : ${interaction.member.displayName} a tenté d'obtenir une cheatsheet en dehors d'un raid, sans succès`);
    }
}

module.exports = {
    data: data,
    execute: execute,
};
