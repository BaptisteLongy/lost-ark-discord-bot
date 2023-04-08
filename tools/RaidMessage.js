const { EmbedBuilder } = require('discord.js');

const supports = require('./supports.json');
const dps = require('./dps.json');
const raids = require('../tools/raidList.json');

function isSupport(playerClass) {
  return supports.some(globalClass => playerClass === globalClass.label);
}

function isDPS(playerClass) {
  return dps.some(globalClass => playerClass === globalClass.label);
}

class RaidMessage {
  constructor() {
    this.raid = '';
    this.mode = '';
    this.gate = '';
    this.description = '';
    this.supports = [];
    this.dps = [];
    this.flex = [];
    this.bench = [];
  }

  initWithEmbed(embed) {
    const raidSplit = embed.title.split(' - ');

    this.raid = raids.find(raid => raidSplit[0].startsWith(raid.value));
    this.mode = Array.isArray(this.raid.modes) ? this.getModeFromTitleSplit(raidSplit[0]) : undefined;
    this.gate = this.getGateFromSplit(raidSplit);
    this.description = embed.description;
    this.supports = this.initRoleList(embed.fields, 'Supports');
    const firstDPS = this.initRoleList(embed.fields, 'DPS');
    const secondDPS = this.initRoleList(embed.fields, '');
    this.dps = [...firstDPS, ...secondDPS];
    this.flex = this.initRoleList(embed.fields, 'Flex');
    this.bench = this.initRoleList(embed.fields, 'Banc');
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
    let theField;
    if (roleListName === '') {
      theField = fields.find(field => {
        return !field.name.startsWith('Supports')
          && !field.name.startsWith('DPS')
          && !field.name.startsWith('Flex')
          && !field.name.startsWith('Banc');
      });
    } else {
      theField = fields.find(field => field.name.startsWith(roleListName));
    }
    const theFieldArray = theField ? theField.value.split('\r') : [];
    const theRoleList = theFieldArray.map(item => {
      const theRoleSplit = item.split(' : ');
      return { player: theRoleSplit[0], class: theRoleSplit[1] };
    });

    return theRoleList;
  }

  changeDescription(newDescription) {
    this.description = newDescription;
  }

  removePlayerFromList(player, list) {
    return list.filter(
      registration => registration.player !== player.toString(),
    );
  }

  removePlayer(player) {
    this.supports = this.removePlayerFromList(player, this.supports);
    this.dps = this.removePlayerFromList(player, this.dps);
    this.flex = this.removePlayerFromList(player, this.flex);
    this.bench = this.removePlayerFromList(player, this.bench);
  }

  reduceClassList(prev, current) {
    if (prev !== '') {
      prev = prev + '\r';
    }
    prev = prev + `${current.player.toString()} : ${current.class}`;
    return prev;
  }

  reduceWaitList(prev, current) {
    if (prev !== '') {
      prev = prev + '\r';
    }
    prev = prev + current.player.toString();
    return prev;
  }

  calculatePlayerNumber() {
    return this.supports.length + this.dps.length + this.flex.length;
  }

  update(player, playerClass) {
    this.removePlayer(player);

    if (isSupport(playerClass)) {
      this.supports.push({ player: player, class: playerClass });
    }

    if (isDPS(playerClass)) {
      this.dps.push({ player: player, class: playerClass });
    }

    if (playerClass === 'Flex') {
      this.flex.push({ player: player });
    }

    if (playerClass === 'Banc de touche') {
      this.bench.push({ player: player });
    }
  }

  generateEmbed() {
    const supportField = this.supports.reduce(this.reduceClassList, '');
    const dpsFirstField = this.dps.slice(0, 3).reduce(this.reduceClassList, '');
    const dpsSecondField = this.dps.length > 3 ? this.dps.slice(3).reduce(this.reduceClassList, '') : '';
    const flexField = this.flex.reduce(this.reduceWaitList, '');
    const benchField = this.bench.reduce(this.reduceWaitList, '');

    const raidEmbed = new EmbedBuilder()
      .setTitle(`${this.raid.value}${this.mode === undefined ? '' : ` ${this.mode}`} - ${this.gate} - ${this.calculatePlayerNumber()}${this.raid.maxPlayer !== false ? `/${this.raid.maxPlayer}` : ''}`)
      .setDescription(this.description)
      .setColor(this.raid.color)
      .setImage(this.raid.img);

    if (supportField !== '') {
      raidEmbed.addFields({ name: `Supports : ${this.supports.length}`, value: supportField, inline: true });
    }

    if (dpsFirstField !== '') {
      raidEmbed.addFields({ name: `DPS : ${this.dps.length}`, value: dpsFirstField, inline: true });
    }

    if (dpsSecondField !== '') {
      raidEmbed.addFields({ name: '\u200B', value: dpsSecondField, inline: true });
    }

    if (flexField !== '') {
      raidEmbed.addFields({ name: `Flex : ${this.flex.length}`, value: flexField });
    }

    if (benchField !== '') {
      raidEmbed.addFields({ name: `Banc : ${this.bench.length}`, value: benchField });
    }

    return raidEmbed;
  }
}

module.exports = {
  RaidMessage,
};