const { execute } = require('./delete_raid');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

jest.mock('../tools/logger.js');

describe('delete_raid', () => {
    beforeAll(() => {
        const dotenv = require('dotenv');
        dotenv.config();
    });

    const mockCallbackForWrongInteraction = jest.fn(() => true);
    const mockFetchMessage = jest.fn(() => Promise.resolve({ content: 'Content of the message by Bar' }));

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

    test('should not be the creator', async () => {
        const memberName = () => 'Foo';

        const mockInteractionWithWrongUser = {
            channel: {
                parentId: process.env.DISCORD_RAID_FORUM_CHANNEL,
                messages: {
                    fetch: mockFetchMessage,
                },
            },
            member: {
                displayName: 'Test Display Name',
                toString: memberName,
                roles: {
                    cache: new Map(),
                },
            },
            reply: mockCallbackForWrongInteraction,
        };

        await execute(mockInteractionWithWrongUser);
        expect(mockCallbackForWrongInteraction).toHaveBeenLastCalledWith({ content: 'Oh Bebou... tu peux pas supprimer le raid de quelqu\'un d\'autre...', ephemeral: true });
    });

    test('should be the creator', async () => {
        const memberName = () => 'Bar';

        const mockInteractionWithRightUser = {
            channel: {
                parentId: process.env.DISCORD_RAID_FORUM_CHANNEL,
                messages: {
                    fetch: mockFetchMessage,
                },
            },
            member: {
                displayName: 'Test Display Name',
                toString: memberName,
                roles: {
                    cache: new Map(),
                },
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

        await execute(mockInteractionWithRightUser);
        expect(mockCallbackForWrongInteraction).toHaveBeenLastCalledWith({ content: 'Es-tu sûr de vouloir supprimer ce raid ?', ephemeral: true, components: [yesNoButtons] });
    });

    test('should be admin', async () => {
        const memberName = () => 'Foo';

        const mockInteractionWithAdmin = {
            channel: {
                parentId: process.env.DISCORD_RAID_FORUM_CHANNEL,
                messages: {
                    fetch: mockFetchMessage,
                },
            },
            member: {
                displayName: 'Test Display Name',
                roles: {
                    cache: new Map([[process.env.DISCORD_SERVER_ADMIN_ROLE, 'foo']]),
                },
                toString: memberName,
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

        await execute(mockInteractionWithAdmin);
        expect(mockCallbackForWrongInteraction).toHaveBeenLastCalledWith({ content: 'Es-tu sûr de vouloir supprimer ce raid ?', ephemeral: true, components: [yesNoButtons] });
    });
});