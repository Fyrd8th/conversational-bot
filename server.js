// geeral dependencies
const fs = require('fs');
const {Dtoken, Wtoken, prefix, DBuser, DBpass, DBaddress} = require('./config/config.json');

// Discord access
const Discord = require('discord.js');
const discordClient = new Discord.Client();
discordClient.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    discordClient.commands.set(command.name, command);
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
const mongoose = require('mongoose');
const mongoDB = `mongodb://${DBuser}:${DBpass}@${DBaddress}`;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error: "));

const Context = require('./models/contextmodel.js');
const Intent = require('./models/intentmodel.js');
// end of database shenanigans


/**
 * STARTING THE PROCESS
 */
discordClient.on('ready', () => {
    console.log('Conversation ready to receive');
});

discordClient.on('message', message => {

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

        const command = discordClient.commands.get(commandName) || discordClient.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
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
        let mood = "";
        let objective = "";
        let output = "";

        witClient.message(message, {})
        .then((data) => {
            //console.log(data['data']);

            // if wit sends legacy reply
            if(data['data'] != undefined) {
                message.reply(`Wit is using some legacy reply, try again later.`);

                //for(let entity in data['data'][0]['__wit__legacy_response']['entities']) 
                //return message.reply('You said: ' + data['data'][0]['__wit__legacy_response']['_text']);
            }
            else {
                Context.findOne({ name: "Fyrd" })
                .exec()
                .then((result) => {
                    //console.log(result);
                    mood = result.mood;
                    objective = result.objective;

                    console.log("Fyrd's mood is: " + mood + "\nand objective is: " + objective);
                })
                .then(() => {
                    for(let entity in data['entities']) {
                        console.log("Wit entity was: "+ entity);
    
                        Intent.findOne({ 
                            id: entity,
                            'res.mood': mood,
                            'res.obj': objective
                        })
                        .select('res.rep')
                        .exec((err, reply) => {
                            if(!err) {
                                console.log(reply);
                                if(reply === null) {
                                   // do nothing, the intent wasn't found
                                   // maybe log these in database for later?
                                }
                                else {
                                    output += reply.rep;
                                }
                            }
                        })
                    }
                });

                if (output == "") {
                    return message.reply(`I don't get you, at all.`);
                }
                else {
                    return message.reply(output);
                }
            }
        })
        .catch(console.error);
    }
});

discordClient.login(Dtoken);