function isAdmin(member) {
    return member.roles.cache.has(process.env.DISCORD_SERVER_ADMIN_ROLE);
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