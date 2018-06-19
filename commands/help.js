const { prefix } = require('../config/config.json');

module.exports = {
    name: 'help',
    description: 'A guide to how to use the bot',
    aliases: ['commands', 'guide', 'helpme'],
    usage: '[command name]',
    execute(message, args) {
        const data = [];
        const { commands } = message.client;

        // send list of commands
        if(!args.length) {
            data.push(`Here's how you can command me: `);
            data.push(commands.map(cmd => cmd.name).join(`\n`));
            data.push(`\nYou can send \`${prefix}help [command name]\` to get info on  a specific command.`);

            return message.channel.send(data, { split: true });
        }

        // send info on specific command
        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply('that\'s not a valid command!');
        }

        data.push(`**Name:** ${command.name}`);

        if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

        message.channel.send(data, { split: true });
    },
};