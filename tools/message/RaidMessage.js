const { Message } = require('./Message.js');

const supports = require('../supports.json');
const dps = require('../dps.json');

function isSupport(playerClass) {
  return supports.some(globalClass => playerClass === globalClass.label);
}

function isDPS(playerClass) {
  return dps.some(globalClass => playerClass === globalClass.label);
}

class RaidMessage extends Message {
  constructor() {
    super();
    this.supports = [];
    this.dps = [];
    this.flex = [];
    this.bench = [];
  }

  initWithEmbed(embed) {
    super.initWithEmbed(embed);

    this.supports = this.initRoleList(embed.fields, 'Supports');
    const firstDPS = this.initRoleList(embed.fields, 'DPS');
    const secondDPS = this.initRoleList(embed.fields, 'DPS (Suite)');
    this.dps = [...firstDPS, ...secondDPS];
    this.flex = this.initRoleList(embed.fields, 'Flex');
    this.bench = this.initRoleList(embed.fields, 'Banc');
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
    const flexField = this.flex.reduce(this.reduceMemberList, '');
    const benchField = this.bench.reduce(this.reduceMemberList, '');

    const raidEmbed = this.initEmbed()
      .setTitle(`${this.raid.value}${this.mode === undefined ? '' : ` ${this.mode}`} - ${this.gate} - ${this.calculatePlayerNumber()}${this.raid.maxPlayer !== false ? `/${this.raid.maxPlayer}` : ''}`);

    if (supportField !== '') {
      raidEmbed.addFields({ name: `Supports : ${this.supports.length}`, value: supportField, inline: true });
    }

    if (dpsFirstField !== '') {
      raidEmbed.addFields({ name: `DPS : ${this.dps.length}`, value: dpsFirstField, inline: true });
    }

    if (dpsSecondField !== '') {
      raidEmbed.addFields({ name: 'DPS (Suite)', value: dpsSecondField, inline: true });
    }

    if (flexField !== '') {
      raidEmbed.addFields({ name: `Flex : ${this.flex.length}`, value: flexField });
    }

    if (benchField !== '') {
      raidEmbed.addFields({ name: `Banc : ${this.bench.length}`, value: benchField });
    }

    return this.finishEmbed(raidEmbed);
  }
}

module.exports = {
  RaidMessage,
};