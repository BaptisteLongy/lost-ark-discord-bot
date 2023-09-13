const { SlashCommandBuilder } = require('discord.js');

const { RaidMessage } = require('../tools/RaidMessage.js');
const logger = require('../tools/logger.js');
const supports = require('../tools/supports.json');
const dps = require('../tools/dps.json');

const adminRoleId = process.env.DISCORD_SERVER_ADMIN_ROLE;

const data = new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Pour faire des trucs d\'admin. Pour savoir comment l\'utiliser, tape /admin --help')
    .addStringOption(option =>
        option.setName('command')
            .setDescription('commande')
            .setRequired(true));

const helpText = 'Voici la liste des commandes supportées\n  --help : affiche cette aide\n  --add "pseudo" "role" : permet d\'ajouter quelqu\'un au raid';

function isSupport(playerClass) {
    return supports.some(globalClass => playerClass === globalClass.label);
}

function isDPS(playerClass) {
    return dps.some(globalClass => playerClass === globalClass.label);
}

function isOtherClass(playerClass) {
    return playerClass === 'Flex' || playerClass === 'Banc de touche';
}

function isRoleValid(playerRole) {
    return isSupport(playerRole) || isDPS(playerRole) || isOtherClass(playerRole);
}

async function addToRaid(interaction, params) {
    if (interaction.channel.parentId === process.env.DISCORD_RAID_FORUM_CHANNEL) {

        const initialMessage = await interaction.channel.messages.fetch(interaction.channel.id);
        const userSearch = await interaction.channel.guild.members.fetch({ query: params[1], limit: 1 });
        const userToAdd = userSearch.values().next().value;
        let role = params[2].charAt(0).toUpperCase() + params[2].slice(1).toLowerCase();
        if (role === 'Bench' || role === 'Banc') {
            role = 'Banc de touche';
        }

        if (userToAdd !== undefined) {
            if (isRoleValid(role)) {
                const raidMessage = new RaidMessage();
                raidMessage.initWithEmbed(initialMessage.embeds[0]);
                raidMessage.update(userToAdd, role);
                const newEmbed = raidMessage.generateEmbed();
                await initialMessage.edit({ embeds: [newEmbed] });
                initialMessage.channel.members.add(userToAdd);

                await interaction.followUp(`C'est bon, ${userToAdd} ajouté en tant que ${role}`);
            } else {
                await interaction.followUp('Désolé, je ne comprends pas ce rôle');
                logger.logAction(interaction, `Warning : ${interaction.member.displayName} a tenté d'utiliser \`/admin --add\` mais je n'ai pas trouvé le rôle ${role}`);
            }

        } else {
            await interaction.followUp('Désolé, je n\'ai pas trouvé de membre avec ce pseudo');
            logger.logAction(interaction, `Warning : ${interaction.member.displayName} a tenté d'utiliser \`/admin --add\` mais je n'ai pas trouvé le membre ${params[1]}`);
        }

    } else {
        await interaction.followUp('Désolé, cette commande ne s\'utilise que dans le thread d\'un raid');
        logger.logAction(interaction, `Warning : ${interaction.member.displayName} a tenté d'utiliser \`/admin --add\` en dehors d'un raid, sans succès`);
    }
}

async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const adminRole = interaction.member.roles.cache.get(adminRoleId);

    if (adminRole === undefined) {
        await interaction.followUp('Désolé, cette commande n\'est que pour les admins. Si tu as besoin de quelque chose, demande aux admins');
    } else {
        const commandParams = interaction.options.getString('command').split(' ');
        switch (commandParams[0]) {
            case '--help':
                await interaction.followUp(helpText);
                return;
            case '--add':
                await addToRaid(interaction, commandParams);
                return;
            default:
                await interaction.followUp('Désolé, je n\'ai pas compris ta commande. Utilise /admin --help pour plus d\'infos');
                return;
        }
    }
}

module.exports = {
    data: data,
    execute: execute,
};
