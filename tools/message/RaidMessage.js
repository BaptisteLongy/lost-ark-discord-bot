const { Message } = require('./Message.js');

const supports = require('../supports.json');
const { getRandomInt } = require('../getRandomInt.js');
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

  initRoleList(fields, roleListName) {
    const theField = fields.find(field => field.name.startsWith(roleListName));
    const theFieldArray = theField ? theField.value.split('\r') : [];
    const theRoleList = theFieldArray.map(item => {
      const theRoleSplit = item.split(' : ');
      return { player: theRoleSplit[0], class: theRoleSplit[1] };
    });

    return theRoleList;
  }

  removePlayer(player) {
    super.removePlayer(player);

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

  diceForList(memberList, thread, introMessage) {
    thread.send({
      content: introMessage,
    });
    memberList.forEach(member => {
      thread.send({
        content: `${member.player} fait un **${getRandomInt(100)}**`,
      });
    });
  }

  diceForAll(channel) {
    if (Array.isArray(this.supports) && this.supports.length > 0) {
      this.diceForList(this.supports, channel, '**Les supports en premier**');
    }
    if (Array.isArray(this.dps) && this.dps.length > 0) {
      this.diceForList(this.dps, channel, '**De la chance chez les DPS ?**');
    }
    if (Array.isArray(this.flex) && this.flex.length > 0) {
      this.diceForList(this.flex, channel, '**Des flex peut-être**');
    }
    if (Array.isArray(this.bench) && this.bench.length > 0) {
      this.diceForList(this.bench, channel, '**Au tour du banc de touche**');
    }
  }

  reduceForMessage(previous, current) {
    return previous === '' ? current.player : `${previous} ${current.player}`;
  }

  async warn(interaction) {
    const warnSupportMessage = this.supports.reduce(this.reduceForMessage, '');
    const warnDPSMessage = this.dps.reduce(this.reduceForMessage, '');
    const warnFlexMessage = this.flex.reduce(this.reduceForMessage, '');
    let warnMessage = warnSupportMessage;
    warnMessage === '' ? warnMessage = warnDPSMessage : warnMessage = `${warnMessage} ${warnDPSMessage}`;
    warnMessage === '' ? warnMessage = warnFlexMessage : warnMessage = `${warnMessage} ${warnFlexMessage}`;

    if (warnMessage !== '') {
      await interaction.channel.send(warnMessage + ' ça part !!!');
    }

    const benchMessage = this.bench.reduce(this.reduceForMessage, '');

    if (benchMessage !== '') {
      await interaction.channel.send(benchMessage + ' on se prépare sur le banc des remplaçants...');
    }
  }

  generateEmbed() {
    const supportField = this.supports.reduce(this.reduceClassList, '');
    const dpsLimit = this.raid.maxPlayer > 8 ? 6 : 3;
    const dpsFirstField = this.dps.slice(0, dpsLimit).reduce(this.reduceClassList, '');
    const dpsSecondField = this.dps.length > dpsLimit ? this.dps.slice(dpsLimit).reduce(this.reduceClassList, '') : '';
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