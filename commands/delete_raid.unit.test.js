const { execute } = require('./delete_raid');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

jest.mock('../tools/logger.js');

describe('delete_raid', () => {
    beforeAll(() => {
        const dotenv = require('dotenv');
        dotenv.config();
    });

    const mockCallbackForWrongInteraction = jest.fn(() => true);

    test('should be in a wrong channel', () => {
        const mockInteractionInWrongChannel = {
            channel: {
                parentId: 'Wrong Parent ID',
            },
            member: {
                displayName: 'Test Display Name',
            },
            reply: mockCallbackForWrongInteraction,
        };

        execute(mockInteractionInWrongChannel);
        expect(mockCallbackForWrongInteraction).toHaveBeenLastCalledWith({ content: 'Désolé, cette commande ne s\'utilise que dans le thread d\'un raid', ephemeral: true });
    });

    test('should not be the creator', () => {
        const memberName = () => 'Foo';

        const mockInteractionWithWrongUser = {
            channel: {
                parentId: process.env.DISCORD_RAID_FORUM_CHANNEL,
            },
            member: {
                displayName: 'Test Display Name',
                toString: memberName,
                roles: {
                    cache: new Map(),
                },
            },
            message: {
                content: 'Content of the message by Bar',
            },
            reply: mockCallbackForWrongInteraction,
        };

        execute(mockInteractionWithWrongUser);
        expect(mockCallbackForWrongInteraction).toHaveBeenLastCalledWith({ content: 'Oh Bebou... tu peux pas supprimer le raid de quelqu\'un d\'autre...', ephemeral: true });
    });

    test('should be the creator', () => {
        const memberName = () => 'Foo';

        const mockInteractionWithRightUser = {
            channel: {
                parentId: process.env.DISCORD_RAID_FORUM_CHANNEL,
            },
            member: {
                displayName: 'Test Display Name',
                toString: memberName,
                roles: {
                    cache: new Map(),
                },
            },
            message: {
                content: 'Content of the message by Foo',
            },
            reply: mockCallbackForWrongInteraction,
        };

        const yesNoButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('yesDeleteRaid')
                .setLabel('Oui je suis sûr !')
                .setStyle(ButtonStyle.Success),
        );

        execute(mockInteractionWithRightUser);
        expect(mockCallbackForWrongInteraction).toHaveBeenLastCalledWith({ content: 'Es-tu sûr de vouloir supprimer ce raid ?', ephemeral: true, components: [yesNoButtons] });
    });

    test('should be admin', () => {
        const memberName = () => 'Foo';
        // const roleCache = new Map();
        // roleCache.set(process.env.DISCORD_SERVER_ADMIN_ROLE, 'foo');

        const mockInteractionWithAdmin = {
            channel: {
                parentId: process.env.DISCORD_RAID_FORUM_CHANNEL,
            },
            member: {
                displayName: 'Test Display Name',
                roles: {
                    cache: new Map([[process.env.DISCORD_SERVER_ADMIN_ROLE, 'foo']]),
                },
                toString: memberName,
            },
            message: {
                content: 'Content of the message by Bar',
            },
            reply: mockCallbackForWrongInteraction,
        };

        const yesNoButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('yesDeleteRaid')
                .setLabel('Oui je suis sûr !')
                .setStyle(ButtonStyle.Success),
        );

        execute(mockInteractionWithAdmin);
        expect(mockCallbackForWrongInteraction).toHaveBeenLastCalledWith({ content: 'Es-tu sûr de vouloir supprimer ce raid ?', ephemeral: true, components: [yesNoButtons] });
    });
});