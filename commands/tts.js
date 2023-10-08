const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('tts')
    .setDescription('TTS');

async function execute(interaction) {
    await interaction.reply({
        content: 'Je fais ça !',
        ephemeral: true,
    });

    const voiceChannel = await interaction.guild.channels.fetch('1148873963741655100');
    voiceChannel.send({
        content: 'N\'oubliez pas de vous inscrire en GVG les amis !',
        tts: true,
    });
}

module.exports = {
    data: data,
    execute: execute,
};