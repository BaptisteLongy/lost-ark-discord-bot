// Require the necessary discord.js classes
const dotenv = require('dotenv');
dotenv.config();
const { Client, Events, GatewayIntentBits } = require('discord.js');


// Google Vision
const vision = require('@google-cloud/vision');
const vision_client = new vision.ImageAnnotatorClient();

// const { token } = require('./config.json');
const token = process.env.LOST_ARK_DISCORD_BOT_TOKEN

// Create a new client instance
const client = new Client({
    intents: [GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    ],
});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // For when I'll reinstate roster sniffer eventually
    // if (message.channel.id === '895331467519983698') {
    if (false) {
        // run code here
        console.log('Message detected');
        // message.attachments[0].value.attachment
        const attachment = message.attachments.at(0)
        const [result] = await vision_client.textDetection(attachment.attachment);
        const detections = result.textAnnotations;
        // console.log('Text:');
        const detectionsArray = detections[0].description.split('\n');
        // debugger

        const allCharacters = [];

        while (detectionsArray.length > 0) {
            const workingArray = [];

            // Init
            workingArray.push(detectionsArray.shift());
            workingArray.push(detectionsArray.shift());
            workingArray.push(detectionsArray.shift());

            try {
                while (workingArray[workingArray.length - 1] && !workingArray[workingArray.length - 1].includes('N. ')) {
                    workingArray.shift();
                    workingArray.push(detectionsArray.shift());
                }
            }
            catch (e) {
                debugger
            }

            if (workingArray[2] && workingArray[2].includes('N. ')) {
                const currentCharacter = {
                    class: workingArray[0],
                    name: workingArray[1],
                    ilvl: workingArray[2].substring(workingArray[2].lastIndexOf(' ') + 1),
                };


                allCharacters.push(currentCharacter);
            }
        }
        // debugger

        message.channel.send(`Liste des persos de ${message.author.username}`);
        allCharacters.forEach(character => {
            message.channel.send(`Nom : ${character.name} - Classe : ${character.class} - Item Level : ${character.ilvl}`)
        })

        // detections.forEach(text => console.log(text));
    }
});

// Log in to Discord with your client's token
client.login(token);