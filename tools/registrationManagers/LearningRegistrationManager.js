const { LearningMessage } = require('../message/LearningMessage.js');
const { RaidRegistrationManager } = require('./RaidRegistrationManager.js');
const logger = require('../logger.js');

class LearningRegistrationManager extends RaidRegistrationManager {
    constructor(interaction, isRaidCreationInteraction, raidThread, learningRole) {
        super(interaction, isRaidCreationInteraction, raidThread);
        this.learningRole = learningRole;
    }

    generateSelectHandlerSuffix() {
        return `${this.learningRole}_learning`;
    }

    async registerAs(role) {
        // Parse the message into a LearningMessage
        const learningMessage = new LearningMessage();

        const initialMessage = await this.thread.fetchStarterMessage();
        learningMessage.initWithEmbed(initialMessage.embeds[0]);

        // Update the RaidMessage
        learningMessage.update(this.interaction.member, role);
        learningMessage.addToLearningRole(this.interaction.member, this.learningRole);

        // Generate the new embed
        const newEmbed = learningMessage.generateEmbed();

        // Send the new embed
        await initialMessage.edit({ embeds: [newEmbed] });

        // Add the member to the thread
        this.thread.members.add(this.interaction.member);

        await this.interaction.editReply({ content: `${this.isRaidCreationInteraction ? `Ton raid est là => ${this.thread}\n` : ''}**Tu es ajouté en tant que ${role} !**\nTu peux encore changer bien sûr` });

        logger.logAction(this.interaction, `Id: ${initialMessage.id} : ${this.interaction.member.displayName} s'est ajouté au raid ${learningMessage.raid.value} - Role : ${role}`);
    }
}

module.exports = {
    LearningRegistrationManager,
};