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
  constructor(embed) {

    this.raid = raids.find(raid => raid.value === embed.title);
    this.description = embed.description;

    this.supports = this.initRoleList(embed.fields, 'Supports');
    this.dps = this.initRoleList(embed.fields, 'DPS');
    this.flex = this.initRoleList(embed.fields, 'Flex');
    this.bench = this.initRoleList(embed.fields, 'Banc de touche');
  }

  initRoleList(fields, roleListName) {
    const theField = fields.find(field => field.name === roleListName);
    const theFieldArray = theField ? theField.value.split('\r') : [];
    const theRoleList = theFieldArray.map(item => {
      const theRoleSplit = item.split(' : ');
      return { player: theRoleSplit[0], class: theRoleSplit[1] };
    });

    return theRoleList;
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
    const dpsField = this.dps.reduce(this.reduceClassList, '');
    const flexField = this.flex.reduce(this.reduceWaitList, '');
    const benchField = this.bench.reduce(this.reduceWaitList, '');

    const raidEmbed = new EmbedBuilder()
      .setTitle(this.raid.value)
      .setDescription(this.description)
      .setColor(this.raid.color)
      .setImage(this.raid.img);

    if (dpsField !== '') {
      raidEmbed.addFields({ name: 'DPS', value: dpsField });
    }

    if (supportField !== '') {
      raidEmbed.addFields({ name: 'Supports', value: supportField });
    }

    if (flexField !== '') {
      raidEmbed.addFields({ name: 'Flex', value: flexField });
    }

    if (benchField !== '') {
      raidEmbed.addFields({ name: 'Banc', value: benchField });
    }

    return raidEmbed;
  }
}

module.exports = {
  RaidMessage,
};