const { EmbedBuilder } = require('discord.js');

const raids = require('../raidList.json');

class Message {
    constructor() {
        this.raid = '';
        this.mode = '';
        this.gate = '';
        this.description = '';
        this.specialRoles = [];
        this.day = '';
        this.time = '';
    }

    initWithEmbed(embed) {
        const raidSplit = embed.title.split(' - ');

        this.raid = raids.find(raid => raidSplit[0].startsWith(raid.value));
        this.mode = Array.isArray(this.raid.modes) ? this.getModeFromTitleSplit(raidSplit[0]) : undefined;
        this.gate = this.getGateFromSplit(raidSplit);
        this.description = embed.description;
        if (Array.isArray(this.raid.specialRoles)) {
            for (const specialRole of this.raid.specialRoles) {
                const newSpecialRole = {
                    'title': specialRole.name,
                    'list': this.initRoleList(embed.fields, specialRole.name),
                };
                this.specialRoles.push(newSpecialRole);
            }
        }
    }

    getModeFromTitleSplit(titleSplit) {
        const stringSplit = titleSplit.split(' ');
        stringSplit.shift();

        return stringSplit.join(' ');
    }

    getGateFromSplit(split) {
        split.shift();
        split.pop();

        return split.join(' - ');
    }

    initRoleList(fields, roleListName) {
        const theField = fields.find(field => field.name.startsWith(roleListName));
        const theFieldArray = theField ? theField.value.split('\r') : [];
        const theRoleList = theFieldArray.map(item => {
            const theRoleSplit = item.split(' : ');
            return { player: theRoleSplit[0], class: theRoleSplit[1] };
        });

        return theRoleList;
    }

    setDay(day) {
        this.day = day;
    }

    setTime(time) {
        this.time = time;
    }

    initDayTime(threadTitle) {
        const threadTitleSplit = threadTitle.split(' - ');
        const dateTime = threadTitleSplit.pop().split(' ');
        this.day = dateTime[0];
        this.time = dateTime[1];
    }

    changeDescription(newDescription) {
        this.description = newDescription;
    }

    toggleSpecialRole(player, specialRole) {
        const selectedRole = this.raid.specialRoles.find(role => role.value === specialRole);
        const selectedRoleList = this.specialRoles.find(roleList => roleList.title === selectedRole.name);
        if (selectedRoleList.list.find(listPlayer => listPlayer.player === player.toString()) === undefined) {
            selectedRoleList.list.push({ player: player });
        } else {
            selectedRoleList.list = selectedRoleList.list.filter(listPlayer => listPlayer.player !== player.toString());
        }
    }

    calculatePlayerNumber() {
        return 0;
    }

    initEmbed() {
        const raidEmbed = new EmbedBuilder()
            .setTitle(`${this.raid.value}${this.mode === undefined ? '' : ` ${this.mode}`} - ${this.gate} - ${this.calculatePlayerNumber()}`)
            .setDescription(this.description)
            .setColor(this.raid.color)
            .setImage(this.raid.img);

        return raidEmbed;
    }

    finishEmbed(embed) {
        if (this.specialRoles.length !== 0) {
            embed.addFields({ name: ' ', value: ' ' });

            for (const specialRole of this.specialRoles) {
                const specialRoleField = specialRole.list.reduce(this.reduceWaitList, '');
                if (specialRoleField !== '') {
                    embed.addFields({ name: `${specialRole.title} : ${specialRole.list.length}`, value: specialRoleField, inline: true });
                }
            }
        }

        return embed;
    }

    generateEmbed() {
        return this.finishEmbed(this.initEmbed());
    }
}

module.exports = {
    Message,
};