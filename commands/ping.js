module.exports = {
    name: 'ping',
    description: 'Ping!',
    aliases: ['hep'],
    execute(message, args) {
        message.channel.send('Oh, shut up.');
    },
};