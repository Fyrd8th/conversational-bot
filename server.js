// geeral dependencies
const fs = require('fs');
const {Dtoken, Wtoken, prefix} = require('./config/config.json');

// for Discord access
const Discord = require('discord.js');
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// for Wit.ai access
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
            //console.log(data);

            if(data['entities'] != null) {
                console.log(data.entities.length);
/*                 for (entity of data['entities']) {
                    const intent = intents.get(entity);
                    console.log(entity);

                    if(!intent) return;

                    // default behaviour, execute command
                    try {
                        intent.execute(message, args);
                    }
                    catch (error) {
                        console.error(error);
                        message.reply('There was error executing the intent.');
                    }
                } */
            }

            return message.reply('You said: ' + data['_text']);
        })
        .catch(console.error);
    }
});

client.login(Dtoken);