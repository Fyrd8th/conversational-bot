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

// database access
const mongoose = require('mongoose');
const mongoDB = `mongodb://${DBuser}:${DBpass}@${DBaddress}`;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error: "));

const Context = require('./models/contextmodel.js');
const Intent = require('./models/intentmodel.js');
const Activity = require('./models/activitymodel.js');
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

        let output = "";

        // ultimately find an intent from input that has a match in database
        Context.findOne({ name: character }) // which character's entities to get
            .exec() //finding context
            .then((result) => {
                //console.log(result);

                // save the current status of the character
                context.mood = result.mood;
                context.objective = result.objective;

                // send message for Wit to process
                return witClient.message(message, {});
            })
            .then(data => {
                let currentIntent;
                let queries= [];
                console.log(data);

                for(let entity in data.entities) {
                    //console.log("Wit entity was: "+ entity); // not needed!
                    queries.push(Intent.findOne({ id: entity }).exec()
                    .then(result => {
                        if(result === null) {
                            // do nothing, the intent wasn't found
                        }
                        else {
                            // return the intent
                            currentIntent = result;
                        }
                    }));
                }

                Promise.all(queries)
                    .then(() => {
                        //console.log("current intent is: ");
                        //console.log(currentIntent);

                        getOutput(currentIntent);
                    })
                    .catch(reason => console.log(reason));
            })
            .catch(err => {
                console.log(err);
                message.reply("I can't handle this right now...");
            });
        
        // for going through the found intent and finding match
        // with the context
        function getOutput(intent) {
            if(!intent) { // handle case where no intent was recognized
                output+= "I don't get you, at all...";
            }
            else { // there is intent, go through options to find match to context
                for (var i = 0, len = intent.res.length; i < len; i++) {
                    const response = intent.res[i];
                    if(response.mood == context.mood && response.obj == context.objective) {
                        output += response.rep;
                        if(response.pro) {
                            output += "\nHow about something like..";
                            // handle getting actions from database
                        }
                        break;
                    }
                }

                // go for default if no context match is found
                if(output == "") {
                    //go reverse, since default should be the last one
                    for(var i = intent.res.length-1; i > 0; i--) {
                        const response = intent.res[i];
                        if(response.mood == "default") {
                            output += response.rep;
                            if(response.pro) {
                                output += " How about something like..";
                                // handle getting actions from database
                            }
                            break;
                        }
                    }
                }
            }
            
            //console.log("reply is:" + output);
            message.reply(output);
            message.channel.stopTyping();
        }
       
    }
});

discordClient.login(Dtoken);