const { Message } = require('./Message.js');
const { getRandomInt } = require('../getRandomInt.js');

class CardRunMessage extends Message {
    constructor() {
        super();
        this.bigDPS = [];
        this.smallDPS = [];
        this.supports = [];
    }

    initWithEmbed(embed) {
        super.initWithEmbed(embed);

        this.bigDPS = this.initRoleList(embed.fields, 'Gros DPS');
        this.smallDPS = this.initRoleList(embed.fields, 'Petits DPS');
        this.supports = this.initRoleList(embed.fields, 'Supports');
    }

    initRoleList(fields, roleListName) {
        const theField = fields.find(field => field.name.startsWith(roleListName));
        const theFieldArray = theField ? theField.value.split('\r') : [];
        const theRoleList = theFieldArray.map(item => {
            const theRoleSplit = item.split(' : ');
            return { player: theRoleSplit[0], number: parseInt(theRoleSplit[1]) };
        });

        return theRoleList;
    }

    removePlayer(player) {
        super.removePlayer(player);

        this.bigDPS = this.removePlayerFromList(player, this.bigDPS);
        this.smallDPS = this.removePlayerFromList(player, this.smallDPS);
        this.supports = this.removePlayerFromList(player, this.supports);
    }

    update(player, bigDPS, smallDPS, supports) {
        this.removePlayer(player);

        this.bigDPS.push({ player: player, number: bigDPS });
        this.smallDPS.push({ player: player, number: smallDPS });
        this.supports.push({ player: player, number: supports });
    }

    reduceNumberList(prev, current) {
        if (prev !== '') {
            prev = prev + '\r';
        }
        prev = prev + `${current.player.toString()} : ${current.number}`;
        return prev;
    }

    reduceNumberInRoleList(prev, current) {
        return prev + parseInt(current.number);
    }

    generateSetOfMembers() {
        const theSet = new Set();

        for (const item of this.bigDPS) {
            theSet.add(item.player);
        }
        for (const item of this.smallDPS) {
            theSet.add(item.player);
        }
        for (const item of this.supports) {
            theSet.add(item.player);
        }

        return theSet;
    }

    calculatePlayerNumber() {
        return this.generateSetOfMembers().size;
    }

    reduceForMessage(previous, current) {
        return previous === '' ? current : `${previous} ${current}`;
    }

    async warn(interaction) {
        let warnMessage;
        for (const member of this.generateSetOfMembers().values()) {
            warnMessage = warnMessage === undefined ? member : `${warnMessage} ${member}`;
        }

        if (warnMessage !== '') {
            await interaction.channel.send(warnMessage + ' ça part !!!');
        }
    }

    diceForAll(channel) {
        channel.send({
            content: '**P\'tit jet de dés pour tout le monde**',
        });
        for (const member of this.generateSetOfMembers().values()) {
            channel.send({
                content: `${member} fait un **${getRandomInt(100)}**`,
            });
        }
    }

    generateEmbed() {
        const bigDPSField = this.bigDPS.reduce(this.reduceNumberList, '');
        const smallDPSField = this.smallDPS.reduce(this.reduceNumberList, '');
        const supportsField = this.supports.reduce(this.reduceNumberList, '');

        const raidEmbed = this.initEmbed();

        if (bigDPSField !== '') {
            raidEmbed.addFields({ name: `Gros DPS : ${this.bigDPS.reduce(this.reduceNumberInRoleList, 0)}`, value: bigDPSField, inline: true });
        }

        if (smallDPSField !== '') {
            raidEmbed.addFields({ name: `Petits DPS : ${this.smallDPS.reduce(this.reduceNumberInRoleList, 0)}`, value: smallDPSField, inline: true });
        }

        if (supportsField !== '') {
            raidEmbed.addFields({ name: `Supports : ${this.supports.reduce(this.reduceNumberInRoleList, 0)}`, value: supportsField, inline: true });
        }

        return this.finishEmbed(raidEmbed);
    }
}

module.exports = {
    CardRunMessage,
};