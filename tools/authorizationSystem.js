function isAdmin(member) {
    const adminRole = member.roles.cache.get(process.env.DISCORD_SERVER_ADMIN_ROLE);
    return adminRole !== undefined;
}

function isRaidCreator(member, raidMessage) {
    return member.toString() === raidMessage.content.split(' ').pop();
}

function canChangeRaid(member, raidMessage) {
    return isAdmin(member) || isRaidCreator(member, raidMessage);
}

module.exports = {
    isAdmin,
    isRaidCreator,
    canChangeRaid,
};