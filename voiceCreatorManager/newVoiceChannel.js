const { ChannelType, PermissionFlagsBits } = require('discord.js');

async function createNewVoiceChannelAndMoveUser(newState) {
    await newState.member.fetch(true);
    await newState.member.user.fetch(true);
    const userName = newState.member.displayName ? newState.member.displayName : newState.member.user.displayName ? newState.member.user.displayName : newState.member.user.username;
    await newState.guild.channels.create({
        name: `Chez ${userName}`,
        type: ChannelType.GuildVoice,
        parent: newState.channel.parent ? newState.channel.parent : undefined,
        permissionOverwrites: [
            {
                id: newState.member,
                allow: PermissionFlagsBits.MuteMembers,
            },
            {
                id: newState.guild.members.me,
                allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.Connect],
            },
        ],
    }).then(async (newChannel) => {
        await newState.member.voice.setChannel(newChannel.id);
    });
}

module.exports = {
    createNewVoiceChannelAndMoveUser,
};