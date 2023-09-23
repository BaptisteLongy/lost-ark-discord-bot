function happensInRaid(interaction) {
    return interaction.channel.parentId === process.env.DISCORD_RAID_FORUM_CHANNEL;
}

module.exports = {
    happensInRaid: happensInRaid,
};