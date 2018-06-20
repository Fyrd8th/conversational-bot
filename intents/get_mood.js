module.exports = {
    name: 'get_mood', // needs to match both the filename and the intent-name at Wit.ai
    description: 'Asking about the mood of the bot',
    execute(message, args) {
        message.channel.send(`I'm not in the mood now.`);
    },
};