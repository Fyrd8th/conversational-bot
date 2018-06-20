// geeral dependencies
const fs = require('fs');
const {Dtoken, Wtoken, prefix, DBuser, DBpass, DBaddress} = require('./config/config.json');

// Discord access
const Discord = require('discord.js');
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// Wit.ai access
const {Wit, log} = require('node-wit');
const witClient = new Wit({
  accessToken: Wtoken,
  logger: new log.Logger(log.DEBUG) // optional
});

// for Wit intents
let intents = new Discord.Collection();
const intentFiles = fs.readdirSync('./intents').filter(file => file.endsWith('.js'));

for (const file of intentFiles) {
    const intent = require(`./intents/${file}`);
    intents.set(intent.name, intent);
}

// database access
const mongoClient = require('mongodb').MongoClient;
const db;
mongoClient.connect(`mongodb://${DBuser}:${DBpass}@${DBaddress}`, (err, db) => {
    if(err) return console.log(err);
    db = client.db('fyrdintents');
})


/**
 * STARTING THE PROCESS
 */
client.on('ready', () => {
    console.log('Conversation ready to receive');
});

client.on('message', message => {

    if (message.author.bot) {
        // don't process the bot's own messages
        return;
    }

    /**
     * COMMANDS
     */
    if(message.content.startsWith(prefix)) {
        // get all words as arguments, extract the first as command
        const args = message.content.slice(prefix.length).split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        // don't process commands that don't exist
        if (!command) return;

        // handle commands that should have arguments, but none are given
        if (command.args && !args.length) {
            let reply = `You didn't provide any arguments, ${message.author}!`;
            
            if (command.usage) {
                reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
            }
            
            return message.channel.send(reply);
        }

        // default behaviour, execute command
        try {
            command.execute(message, args);
        }
        catch (error) {
            console.error(error);
            message.reply('There was error executing the command.');
        }
    }
    /**
     * NLU MESSAGES
     */
    else {
        witClient.message(message, {})
        .then((data) => {
            //console.log(data['data']);

            if(data['data'][0]['__wit__legacy_response'] != undefined) {
                for(let entity in data['data'][0]['__wit__legacy_response']['entities']) {
                    console.log(entity);
                    const intent = intents.get(entity);
                    args = {}; // context variables here?

                    if (!intent) {
                        return message.reply(`I don't get you, at all.`);
                    }

                    // default behaviour, execute command
                    try {
                        intent.execute(message, args);
                    }
                    catch (error) {
                        console.error(error);
                        message.reply(`I can't process that.`);
                    }
                }

                //return message.reply('You said: ' + data['data'][0]['__wit__legacy_response']['_text']);
            }
            else {
                return message.reply(`I'm still working on this portion of my code`);
            }
        })
        .catch(console.error);
    }
});

client.login(Dtoken);