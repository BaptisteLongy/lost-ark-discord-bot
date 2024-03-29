const { EmbedBuilder } = require('discord.js');

const raids = require('../raidList.json');
const days = require('../days.json');
const { getIDForTag } = require('../getIDForTag.js');

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
                    'list': this.initList(embed.fields, specialRole.name),
                };
                this.specialRoles.push(newSpecialRole);
            }
        }
    }

    generateForumThreadTitle() {
        return `${this.raid.value}${this.mode === undefined ? '' : ` ${this.mode}`} - ${this.gate} - ${this.day} ${this.time}`;
    }

    getModeFromTitleSplit(titleSplit) {
        const stringSplit = titleSplit.split(' ');

        const modeFiltered = stringSplit.filter((item, index, array) => {
            return index === array.length - 1 || index === array.length - 2;
        });

        return modeFiltered.join(' ');
    }

    getGateFromSplit(split) {
        split.shift();
        split.pop();

        return split.join(' - ');
    }

    initList(fields, listName) {
        const theField = fields.find(field => field.name.startsWith(listName));
        const theFieldArray = theField ? theField.value.split('\r') : [];
        const theList = theFieldArray.map(item => {
            return { player: item };
        });

        return theList;
    }

    setDay(day) {
        this.day = day;
    }

    setTime(time) {
        this.time = time;
    }

    initDayTime(thread) {
        for (const uniqueDay of days) {
            const dayTagId = getIDForTag(uniqueDay.value, thread.parent.availableTags);
            if (thread.appliedTags.some((tag) => {return tag === dayTagId;})) {
                this.day = uniqueDay.value;
            }
        }

        this.time = thread.name.split(`${this.day} `).pop();
    }

    removePlayerFromList(player, list) {
        if (Array.isArray(list)) {
            return list.filter(
                registration => registration.player !== player.toString(),
            );
        }
    }

    removePlayer(player) {
        for (const specialRoleList of this.specialRoles) {
            specialRoleList.list = this.removePlayerFromList(player, specialRoleList.list);
        }
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

    reduceMemberList(prev, current) {
        if (prev !== '') {
            prev = prev + '\r';
        }
        prev = prev + current.player.toString();
        return prev;
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
                const specialRoleField = specialRole.list.reduce(this.reduceMemberList, '');
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