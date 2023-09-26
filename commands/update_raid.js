const { SlashCommandBuilder, RateLimitError } = require('discord.js');
const { RaidMessage } = require('../tools/RaidMessage.js');

const days = require('../tools/days.json');
const logger = require('../tools/logger.js');
const { happensInRaid } = require('../tools/happensInRaid.js');
const { canChangeRaid } = require('../tools/authorizationSystem.js');

const data = new SlashCommandBuilder()
    .setName('update')
    .setDescription('Pour modifier le raid')
    .addStringOption(option =>
        option.setName('gate')
            .setDescription('Si tu veux changer la gate'))
    .addStringOption(option =>
        option.setName('jour')
            .setDescription('Si tu veux changer le jour')
            .addChoices(...days))
    .addStringOption(option =>
        option.setName('heure')
            .setDescription('Si tu veux changer l\'heure'))
    .addBooleanOption(option =>
        option.setName('learning')
            .setDescription('Si tu veux changer le statut learning'));

function getIDForTag(tagName, tagList) {
    return tagList.find(tag => tag.name === tagName).id;
}

function updateDayTag(threadTagsList, day, availableTags) {
    for (const uniqueDay of days) {
        const dayTagId = getIDForTag(uniqueDay.value, availableTags);
        threadTagsList = threadTagsList.filter((tag) => { return tag !== dayTagId; });
    }

    threadTagsList.push(getIDForTag(day, availableTags));

    return threadTagsList;
}

function updateChangelog(changelog, newChangelog) {
    return changelog === '' ? newChangelog : `${changelog} - ${newChangelog}`;
}

function generateChangelog(interaction) {
    let changelog = '';

    const day = interaction.options.getString('jour');
    if (day !== null) {
        changelog = updateChangelog(changelog, `Nouveau jour : ${day}`);
    }

    const time = interaction.options.getString('heure');
    if (time !== null) {
        changelog = updateChangelog(changelog, `Nouvelle heure : ${time}`);
    }

    const gate = interaction.options.getString('gate');
    if (gate !== null) {
        changelog = updateChangelog(changelog, `Nouvelle gate : ${gate}`);
    }

    const learning = interaction.options.getBoolean('learning');
    if (learning !== null) {
        changelog = learning ? updateChangelog(changelog, 'Le raid devient un learning') : updateChangelog(changelog, 'Le raid n\'est plus un learning');
    }

    return changelog;
}

function initRaid(raidMessage, interaction, message, thread) {
    raidMessage.initWithEmbed(message.embeds[0]);
    raidMessage.initDayTime(thread.name);
    if (interaction.options.getString('jour') !== null) {
        raidMessage.setDay(interaction.options.getString('jour'));
    }
    if (interaction.options.getString('heure') !== null) {
        raidMessage.setTime(interaction.options.getString('heure'));
    }
    if (interaction.options.getString('gate') !== null) {
        raidMessage.gate = interaction.options.getString('gate');
    }
}

function updateLearningTag(threadTagsList, learning, availableTags) {
    const learningTagId = getIDForTag('learning', availableTags);
    threadTagsList = threadTagsList.filter((tag) => { return tag !== learningTagId; });
    if (learning) {
        threadTagsList.push(learningTagId);
    }
    return threadTagsList;
}

function generateNewTags(thread, interaction) {
    let tags = thread.appliedTags;

    const day = interaction.options.getString('jour');
    if (day !== null) {
        tags = updateDayTag(tags, day, thread.parent.availableTags);
    }

    const learning = interaction.options.getBoolean('learning');
    if (learning !== null) {
        tags = updateLearningTag(tags, learning, thread.parent.availableTags);
    }

    return tags;
}

async function updateRaid(interaction, message, thread) {
    const raidMessage = new RaidMessage();
    initRaid(raidMessage, interaction, message, thread);

    const tags = generateNewTags(thread, interaction);

    const threadName = raidMessage.generateForumThreadTitle();
    const raidEmbed = raidMessage.generateEmbed();

    await thread.edit({
        name: threadName,
        appliedTags: tags,
    })
        .catch((e) => {
            throw e;
        });

    await message.edit({ embeds: [raidEmbed] });
}

async function execute(interaction) {
    if (happensInRaid(interaction)) {
        const initialMessage = await interaction.channel.messages.fetch(interaction.channel.id);
        if (canChangeRaid(interaction.member, initialMessage)) {
            await updateRaid(interaction, initialMessage, interaction.channel).then(
                async () => {
                    const changelog = generateChangelog(interaction);
                    await interaction.reply({
                        content: `@here: ${interaction.member} a modifié le raid\n${changelog}`,
                        allowedMentions: { parse: ['everyone'] },
                    });
                    logger.logAction(interaction, `Id: ${initialMessage.id} : ${interaction.member.displayName} a modifié le raid\n${changelog}`);
                })
                .catch(async (e) => {
                    if (e instanceof RateLimitError) {
                        await interaction.reply({
                            content: 'Désolé, Discord m\'empèche de modifier un thread plus de 2 fois en 10 minutes, reviens plus tard !',
                            ephemeral: true,
                        });
                    } else {
                        throw e;
                    }
                });

        } else {
            await interaction.reply({ content: 'Oh Bebou... tu peux pas modifier le raid de quelqu\'un d\'autre...', ephemeral: true });
        }
    } else {
        await interaction.reply({ content: 'Désolé, cette commande ne s\'utilise que dans le thread d\'un raid', ephemeral: true });
        logger.logAction(interaction, `Warning : ${interaction.member.displayName} a tenté d'utiliser \`/update\` en dehors d'un raid, sans succès`);
    }
}

module.exports = {
    data: data,
    execute: execute,
};