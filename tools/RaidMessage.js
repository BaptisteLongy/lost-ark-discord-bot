const { EmbedBuilder } = require('discord.js');

const supports = ['bard', 'paladin', 'artist'];
const dps = ['sorceress'];

function isSupport(playerClass) {
  return supports.some(globalClass => playerClass === globalClass);
}

function isDPS(playerClass) {
  return dps.some(globalClass => playerClass === globalClass);
}

class RaidMessage {
    constructor(embed) {

      this.title = embed.title;
      this.description = embed.description;

      const supportField = embed.fields.find(field => field.name === 'Supports');
      const supportArray = supportField ? supportField.value.split('\r') : [];

      this.supports = supportArray.map(support => {
        const supportSplit = support.split(' : ');
        return { player : supportSplit[0], class: supportSplit[1] };
      });

      const dpsField = embed.fields.find(field => field.name === 'DPS');
      const dpsArray = dpsField ? dpsField.value.split('\r') : [];

      // this.dps = [];
      this.dps = dpsArray.map(individualDPS => {
        const dpsSplit = individualDPS.split(' : ');
        return { player : dpsSplit[0], class: dpsSplit[1] };
      });

      this.flex = [];
    }

    update(player, playerClass) {

      this.supports = this.supports.filter(
        support => support.player !== player.toString(),
      );
      this.dps = this.dps.filter(
        individualDPS => individualDPS.player !== player.toString(),
      );

      if (isSupport(playerClass)) {
        this.supports.push({ player: player, class: playerClass });
      }

      if (isDPS(playerClass)) {
        this.dps.push({ player: player, class: playerClass });
      }

    }

    generateEmbed() {
      const supportField = this.supports.reduce(
        (prev, current) => {
          if (prev !== '') {
            prev = prev + '\r';
          }
          prev = prev + `${current.player.toString()} : ${current.class}`;
          return prev;
        }, '',
      );

      const dpsField = this.dps.reduce(
        (prev, current) => {
          if (prev !== '') {
            prev = prev + '\r';
          }
          prev = prev + `${current.player.toString()} : ${current.class}`;
          return prev;
        }, '',
      );

      const exampleEmbed = new EmbedBuilder()
        .setTitle(this.title)
        .setDescription(this.description);

      if (dpsField !== '') {
        exampleEmbed.addFields({ name: 'DPS', value: dpsField });
      }

      if (supportField !== '') {
        exampleEmbed.addFields({ name: 'Support', value: supportField });
      }

      return exampleEmbed;
    }
  }

module.exports = {
	RaidMessage,
};