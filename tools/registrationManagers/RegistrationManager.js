class RegistrationManager {
    constructor(interaction, isRaidCreationInteraction, thread) {
        this.interaction = interaction;
        this.isRaidCreationInteraction = isRaidCreationInteraction;

        if (interaction.message && interaction.message.mentions && interaction.message.mentions.channels && interaction.message.mentions.channels.size > 0) {
            this.thread = interaction.message.mentions.channels.values().next().value;
        } else {
            this.thread = thread;
        }
    }
}

module.exports = {
    RegistrationManager,
};