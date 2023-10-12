const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const { happensInRaid } = require('../tools/happensInRaid.js');
const logger = require('../tools/logger.js');


const data = new SlashCommandBuilder()
    .setName('deleteraid')
    .setDescription('Supprimer le raid où tu es');

async function execute(interaction) {
    const adminRoleId = process.env.DISCORD_SERVER_ADMIN_ROLE;

    if (happensInRaid(interaction)) {
        const initialMessage = await interaction.channel.messages.fetch(interaction.channel.id);
        if (!interaction.member.roles.cache.has(adminRoleId) && interaction.member.toString() !== initialMessage.content.split(' ').pop()) {
            await interaction.reply({ content: 'Oh Bebou... tu peux pas supprimer le raid de quelqu\'un d\'autre...', ephemeral: true });
        } else {
            const yesNoButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('yesDeleteRaid')
                        .setLabel('Oui je suis sûr !')
                        .setStyle(ButtonStyle.Success),
                );
            await interaction.reply({ content: 'Es-tu sûr de vouloir supprimer ce raid ?', ephemeral: true, components: [yesNoButtons] });
        }
    } else {
        await interaction.reply({ content: 'Désolé, cette commande ne s\'utilise que dans le thread d\'un raid', ephemeral: true });
        logger.logAction(interaction, `Warning : ${interaction.member.displayName} a tenté d'utiliser \`/deleteraid\` en dehors d'un raid, sans succès`);
    }
}

module.exports = {
    data: data,
    execute: execute,
};