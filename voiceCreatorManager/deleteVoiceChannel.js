async function deleteVoiceChannel(oldState) {
    // const channelToDelete = oldState.channel;
    await oldState.guild.channels.delete(oldState.channel);
}

module.exports = {
    deleteVoiceChannel,
};