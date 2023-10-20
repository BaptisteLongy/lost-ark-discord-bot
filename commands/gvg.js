const { SlashCommandBuilder } = require('discord.js');

const logger = require('../tools/logger.js');


const data = new SlashCommandBuilder()
    .setName('gvg')
    .setDescription('Gestion de la GVG')
    .addSubcommand(subcommand =>
        subcommand
            .setName('publicite')
            .setDescription('Fais de la pub pour la GVG')
            .addIntegerOption(option =>
                option.setName('participants')
                    .setDescription('Nombre de participants déjà inscrits')
                    .setRequired(true)));

function generatePubliciteMessage(numberParticipants, roleToMention) {
    if (numberParticipants < 1) {
        return (`${roleToMention} Le reset a eu lieu, il est temps d'aller s'inscrire in game pour la GVG, venez ramasser des golds facilement !`);
    } else if (numberParticipants < 4) {
        return (`${roleToMention} Uniquement ${numberParticipants} pour la GVG, il nous faut du monde. N'oubliez psa qu'on clôture les inscriptions dimanche à midi pour savoir sur quelle île on va.`);
    } else if (numberParticipants < 8) {
        return (`${roleToMention} On est ${numberParticipants} pour la GVG, il manque plus grand monde ! Allez vous inscrire in game si c'est pas déjà fait !`);
    } else if (numberParticipants < 16) {
        return (`${roleToMention} Waouh ! Déjà ${numberParticipants} inscrits en GVG ! On continue comme ça et avec plus de participants on pourra viser encore plus de golds !`);
    } else {
        return (`${roleToMention} On est ${numberParticipants} inscrits en GVG ! :tada: Si certains ne se sont pas inscrits, ils peuvent toujours le faire bien entendu`);
    }
}

async function treatPublicite(interaction) {
    await interaction.reply({ content: 'Je m\'en charge !', ephemeral: true });

    const notificationChannelId = process.env.DISCORD_SERVER_NOTIFICATION_CHANNEL;
    const guildMemberRoleId = process.env.DISCORD_SERVER_GUILD_MEMBER_ROLE;

    const message = generatePubliciteMessage(interaction.options.getInteger('participants'), await interaction.guild.roles.fetch(guildMemberRoleId));

    await interaction.guild.channels.fetch(notificationChannelId)
        .then(channel => channel.send(message))
        .catch(console.error);

        logger.logAction(interaction, `Info : ${interaction.member.displayName} a utilisé \`/gvg publicité ${interaction.options.getInteger('participants')}\`.`);
}

async function execute(interaction) {
    const officerRoleId = process.env.DISCORD_SERVER_OFFICER_ROLE;

    if (!interaction.member.roles.cache.has(officerRoleId)) {
        await interaction.reply({ content: 'Oh Bebou... seuls les officiers peuvent utiliser cette commande...', ephemeral: true });
        logger.logAction(interaction, `Warning : ${interaction.member.displayName} a tenté d'utiliser \`/gvg\` sans être officier`);
    } else {
        const subCommand = interaction.options.getSubcommand();
        switch (subCommand) {
            case 'publicite':
                await treatPublicite(interaction);
                break;
            default:
                await interaction.reply({ content: 'Désolé, je ne connais pas cette commande', ephemeral: true });
        }
    }
}

module.exports = {
    data: data,
    execute: execute,
};