const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { RaidMessage } = require('./message/RaidMessage.js');
const logger = require('./logger.js');
const { getIDForTag } = require('./getIDForTag.js');
const baseClassList = require('./baseClasses.json');
const supports = require('./supports.json');
const dps = require('./dps.json');

class RaidRegistrationManager {
    constructor(interaction, isRaidCreationInteraction, raidThread) {
        this.interaction = interaction;
        this.isRaidCreationInteraction = isRaidCreationInteraction;

        if (interaction.message && interaction.message.mentions && interaction.message.mentions.channels && interaction.message.mentions.channels.size > 0) {
            this.thread = interaction.message.mentions.channels.values().next().value;
        } else {
            this.thread = raidThread;
        }
    }

    generateBaseClassSelectRow() {
        return new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('baseClassSelect')
                    .setPlaceholder('Archetype')
                    .addOptions(...baseClassList),
            );
    }

    generateSelectMenuForBaseClass(baseClass) {
        const selectOptions = [...supports, ...dps].filter(uniqueClass => uniqueClass.baseClass === baseClass.label)
            .sort((classA, classB) => {
                return classA.value.localeCompare(classB.value);
            });

        return new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('classSelect')
                    .setPlaceholder(baseClass.label)
                    .addOptions(...selectOptions),
            );
    }

    generateButtonsRow() {
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('register_flex')
                    .setLabel('Flex')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('register_bench')
                    .setLabel('Banc de touche')
                    .setStyle(ButtonStyle.Primary),
            );
    }

    generateCardRunAvailabilityModal() {
        const cardRunAvailabilityModal = new ModalBuilder()
            .setCustomId('cardRunAvailabilityModal')
            .setTitle('Il ressemble à quoi ton roster ?');

        const bigDPSInput = new TextInputBuilder()
            .setCustomId('bigDPSInput')
            .setLabel('Combien de gros DPS ?')
            .setStyle(TextInputStyle.Short)
            .setValue('0');

        const smallDPSInput = new TextInputBuilder()
            .setCustomId('smallDPSInput')
            .setLabel('Combien de petits DPS ?')
            .setStyle(TextInputStyle.Short)
            .setValue('0');

        const supportsInput = new TextInputBuilder()
            .setCustomId('supportsInput')
            .setLabel('Combien de supports ?')
            .setStyle(TextInputStyle.Short)
            .setValue('0');

        const bigDPSRow = new ActionRowBuilder()
            .addComponents([bigDPSInput]);

        const smallDPSRow = new ActionRowBuilder()
            .addComponents([smallDPSInput]);

        const supportsRow = new ActionRowBuilder()
            .addComponents([supportsInput]);

        cardRunAvailabilityModal.addComponents([bigDPSRow, smallDPSRow, supportsRow]);

        return cardRunAvailabilityModal;
    }

    async initCreationInteraction() {
        const cardRunTagId = getIDForTag('card run', this.thread.parent.availableTags);

        if (this.thread.appliedTags.find((tag) => { return tag === cardRunTagId; }) === undefined) {
            await this.interaction.followUp({
                content: `Ton raid est là => ${this.thread}\nTu viens avec quoi ? (n'oublie pas de cliquer sur "Cacher le message" une fois que tu as fini)`,
                components: [this.generateBaseClassSelectRow(), this.generateButtonsRow()],
            });
        } else {
            await this.interaction.followUp({
                content: `Ton raid est là => ${this.thread}\nN'oubile pas d'aller inscrire ton roster pour le card run`,
            });
        }
    }

    async updateRegistrationOnBaseClassPick() {
        const baseClass = baseClassList.find(baseClassTemp => baseClassTemp.value === this.interaction.values[0]);

        // Send the new embed
        await this.interaction.editReply({ components: [this.generateBaseClassSelectRow(), this.generateSelectMenuForBaseClass(baseClass), this.generateButtonsRow()] });
    }

    async initRegisterInteraction() {
        const cardRunTagId = getIDForTag('card run', this.thread.parent.availableTags);

        if (this.thread.appliedTags.find((tag) => { return tag === cardRunTagId; }) === undefined) {
            await this.interaction.reply({
                content: 'Tu viens avec quoi ? (n\'oublie pas de cliquer sur "Cacher le message" une fois que tu as fini)',
                ephemeral: true, components: [this.generateBaseClassSelectRow(), this.generateButtonsRow()],
            });
        } else {
            await this.interaction.showModal(this.generateCardRunAvailabilityModal());
        }
    }

    async registerAs(role) {
        // Parse the message into a RaidMessage
        const raidMessage = new RaidMessage();

        const initialMessage = await this.thread.fetchStarterMessage();
        raidMessage.initWithEmbed(initialMessage.embeds[0]);

        // Update the RaidMessage
        raidMessage.update(this.interaction.member, role);

        // Generate the new embed
        const newEmbed = raidMessage.generateEmbed();


        // Send the new embed
        await initialMessage.edit({ embeds: [newEmbed] });

        // Add the member to the thread
        this.thread.members.add(this.interaction.member);

        await this.interaction.editReply({ content: `${this.isRaidCreationInteraction ? `Ton raid est là => ${this.thread}\n` : ''}**Tu es ajouté en tant que ${role} !**\nTu peux encore changer bien sûr` });

        logger.logAction(this.interaction, `Id: ${initialMessage.id} : ${this.interaction.member.displayName} s'est ajouté au raid ${raidMessage.raid.value} - Role : ${role}`);
    }
}

module.exports = {
    RaidRegistrationManager,
};