// geeral dependencies
const fs = require('fs');
const {Dtoken, Wtoken, prefix, character, DBuser, DBpass, DBaddress} = require('./config/config.json');

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

// for Wit intents/database handling
// in-progress
//const getReply = require('./intents/getReply.js');
//const getContext = require('./intents/getContext.js');

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
        message.channel.startTyping();

        let context = {
            mood: "",
            objective: ""
        }

        let replysent = false; // used for sending just one reply
        let output = "";

        Context.findOne({ name: character }) // which character's entities to get
            .exec() //finding context
            .then((result) => {
                //console.log(result);

                // save the current status of the character
                context.mood = result.mood;
                context.objective = result.objective;
            })
            .then(() => {
                return witClient.message(message, {});
            })
            .then(data => {
                let currentIntent;

                /* Promise.aLL?
                for(let entity in data[entities]) {
                    console.log("Wit entity was: "+ entity);
                    Intent.findOne({ id: entity }).exec()
                        .then(result => {
                            if(result === null) {
                                // do nothing, the intent wasn't found
                            }
                            else {
                                // return the intent
                                
                            }
                        })
                }
                */

                message.channel.stopTyping();
            })
            /*
            .then(() => {
                for (var i = 0, len = reply.res.length; i < len; i++) {
                    const res = reply.res[i];
                    if(res.mood == mood && res.obj == objective) {
                        output += res.rep;
                        break;
                    }
                }
            })
            */
            .catch(err => console.log(err));
        
        /*
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
                Context.findOne({ name: character }) // which character's entities to get
                .exec()
                .then((result) => {
                    //console.log(result);

                    // save the current status of the character
                    mood = result.mood;
                    objective = result.objective;

                    console.log(character + "'s mood is: " + mood + "\nand objective is: " + objective);
                })
                .then(() => {
                    // There might be multiple entities in the Wit response
                    // We want just the one matching the database
                    for(let entity in data['entities']) {
                        console.log("Wit entity was: "+ entity);
    
                        Intent.findOne({ 
                            id: entity,
                            'res.mood': mood,
                            'res.obj': objective
                        })
                        .exec()
                        .then((reply) => {
                            if(reply === null) {
                                // do nothing, the intent wasn't found
                                // maybe log these in database for later?
                                // output = "I have no words for that...";
                            }
                            else {
                                // finding the response matching the mood and objective in context
                                for (var i = 0, len = reply.res.length; i < len; i++) {
                                    const res = reply.res[i];
                                    if(res.mood == mood && res.obj == objective) {
                                        output += res.rep;
                                        break;
                                    }
                                }
                            }
                        })
                        .then(() => {
                            // see if a reply has already been posted
                            if(!replysent) {
                                if (output == "") {
                                    // do nothing
                                    // return message.reply(`I don't get you, at all.`);
                                }
                                else {
                                    replysent = true;
                                    message.channel.stopTyping();
                                    return message.reply(output, {split: true});
                                }
                            }
                        })
                        .catch((err) => console.log(err));
                    }
                })
                .catch((err) => console.log("Finding context gives error:" + err));
            }
        })
        .catch(console.error);
        */
       
    }
});

discordClient.login(Dtoken);