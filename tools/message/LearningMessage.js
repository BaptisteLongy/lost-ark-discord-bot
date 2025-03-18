const { RaidMessage } = require('./RaidMessage.js');

class LearningMessage extends RaidMessage {
    constructor() {
        super();
        this.learners = [];
        this.veterans = [];
    }

    addToLearningRole(player, learningRole) {
        this.learners = this.learners.filter(listPlayer => listPlayer.player !== player.toString());
        this.veterans = this.veterans.filter(listPlayer => listPlayer.player !== player.toString());

        if (learningRole === 'learner') {
            this.learners.push({ player: player });
        }
        if (learningRole === 'veteran') {
            this.veterans.push({ player: player });
        }
    }

    removePlayer(player) {
        super.removePlayer(player);

        this.learners = this.removePlayerFromList(player, this.learners);
        this.veterans = this.removePlayerFromList(player, this.veterans);
    }

    toggleLearningRole(player, learningRole) {
        const isLearner = this.learners.find(listPlayer => listPlayer.player === player.toString()) !== undefined;
        const isVeteran = this.veterans.find(listPlayer => listPlayer.player === player.toString()) !== undefined;

        if (learningRole === 'learner' && isLearner) {
            this.learners = this.learners.filter(listPlayer => listPlayer.player !== player.toString());
        } else if (learningRole === 'learner' && !isLearner) {
            this.learners.push({ player: player });
            if (isVeteran) {
                this.veterans = this.veterans.filter(listPlayer => listPlayer.player !== player.toString());
            }
        } else if (isVeteran) {
            this.veterans = this.veterans.filter(listPlayer => listPlayer.player !== player.toString());
        } else {
            this.veterans.push({ player: player });
            if (isLearner) {
                this.learners = this.learners.filter(listPlayer => listPlayer.player !== player.toString());
            }
        }
    }

    initWithEmbed(embed) {
        super.initWithEmbed(embed);

        this.learners = this.initList(embed.fields, 'Elèves');
        this.veterans = this.initList(embed.fields, 'Accompagnants');
    }

    generateEmbed() {
        const learnersField = this.learners.reduce(this.reduceMemberList, '');
        const veteransField = this.veterans.reduce(this.reduceMemberList, '');

        const learningEmbed = super.generateEmbed();


        learningEmbed.addFields({ name: ' ', value: ' ' });

        if (learnersField !== '') {
            learningEmbed.addFields({ name: `Elèves : ${this.learners.length}`, value: learnersField, inline: true });
        }

        if (veteransField !== '') {
            learningEmbed.addFields({ name: `Accompagnants : ${this.veterans.length}`, value: veteransField, inline: true });
        }

        return learningEmbed;
    }
}

module.exports = {
    LearningMessage,
};