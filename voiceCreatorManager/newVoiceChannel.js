const { ChannelType, PermissionFlagsBits } = require('discord.js');

async function createNewVoiceChannelAndMoveUser(newState) {
    await newState.member.fetch(true);
    await newState.member.user.fetch(true);
    const userName = newState.member.displayName ? newState.member.displayName : newState.member.user.displayName ? newState.member.user.displayName : newState.member.user.username;
    const channelList = newState.channel.parent.children.cache;
    let creationPosition = 0;
    for (const value of channelList.values()) {
        if (value.id === process.env.DISCORD_VOICE_CHANNEL_CREATOR_ID) {
            creationPosition = Math.max(creationPosition, value.position + 1);
        } else if (value.name.startsWith('Chez ')) {
            creationPosition = Math.max(creationPosition, value.position + 1);
        }
    }
    const newChannel = await newState.guild.channels.create({
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
    });
    await newChannel.edit({ position: creationPosition });
    await newState.member.voice.setChannel(newChannel.id);
}

module.exports = {
    createNewVoiceChannelAndMoveUser,
};