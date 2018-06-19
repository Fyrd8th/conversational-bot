module.exports = {
    name: 'mood',
    description: 'Asking about the mood of the bot',
    execute(message, args) {
        message.channel.send(`I'm not in the mood now.`);
    },
};