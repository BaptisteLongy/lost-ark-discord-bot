const { isAdmin, isRaidCreator } = require('../../tools/authorizationSystem');

describe('authorizationSystem', () => {
    beforeAll(() => {
        const dotenv = require('dotenv');
        dotenv.config();
    });

    test('should be admin', () => {
        expect(isAdmin({ roles: { cache : new Map([[process.env.DISCORD_SERVER_ADMIN_ROLE, 'foo']]) } })).toBeTruthy();
    });

    test('should not be admin', () => {
        expect(isAdmin({ roles: { cache : new Map([['0000000000000000000', 'foo']]) } })).toBeFalsy();
    });

    test('should be raid creator', () => {
        expect(isRaidCreator('Foo', { content: 'Raid by Foo' })).toBeTruthy();
    });

    test('should not be raid creator', () => {
        expect(isRaidCreator('Foo', { content: 'Raid by Bar' })).toBeFalsy();
    });
});