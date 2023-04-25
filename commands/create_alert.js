const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const logger = require('../tools/logger.js');

const adminRoleId = process.env.DISCORD_SERVER_ADMIN_ROLE;

const data = new SlashCommandBuilder()
    .setName('alerte')
    .setDescription('Ajoute une alerte au serveur')
    .addStringOption(option =>
        option.setName('titre')
            .setDescription('Nom de l\'alerte')
            .setRequired(true));

const buttonRow = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('subscribe_to_alert')
            .setLabel('Je m\'inscris')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('send_alert')
            .setLabel('J\'y vais, je préviens !')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('unsubscribe_from_alert')
            .setLabel('Je me désinscris')
            .setStyle(ButtonStyle.Danger),
    );

async function execute(interaction) {
    const adminRole = interaction.member.roles.cache.get(adminRoleId);

    if (adminRole === undefined) {
        await interaction.reply({
            content: 'T\'as sans doute une super idée mais l\'ajout d\'alerte est réservé aux admins.\nPropose leur ton idée !',
            ephemeral: true,
        });
    } else {
        const title = interaction.options.getString('titre');
        let messageId;

        await interaction.reply({
            content: `**${title}** - Pour s'inscrire c'est en dessous.`,
            components: [buttonRow],
        })
            .then(async (response) => {
                const message = await response.fetch();
                messageId = message.id;
                await message.startThread({
                    name: `${title} - Alertes`,
                });
            });
        logger.logAction(interaction, `Id: ${messageId} : ${interaction.member.displayName} a créé une alerte ${title} dans le channel ${interaction.channel}`);
    }
}

module.exports = {
    data: data,
    execute: execute,
};