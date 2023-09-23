const { happensInRaid } = require('../../tools/happensInRaid');

describe('happensInRaid', () => {
    beforeAll(() => {
        const dotenv = require('dotenv');
        dotenv.config();
    });

    test('should be in raid', () => {
        expect(happensInRaid({ channel: { parentId: process.env.DISCORD_RAID_FORUM_CHANNEL } })).toBeTruthy();
    });

    test('should not be in raid', () => {
        expect(happensInRaid({ channel: { parentId: '0000000000000000000' } })).toBeFalsy();
    });
});