// everything inside +..+ is the stuff that needs to be implemented
// notice to remove the +-signs
module.exports = {
    name: '+ command's name +',
    description: '+ description +',
    aliases: ['+ alias +'], // so that can be used with other commands
    args: + true/false +, // if the command needs arguments
    usage: '+ <argument1> <argument2> ... +', // to give feedback what arguments are needed
    execute(message, args) {
        message.channel.send('+ The response to the channel +');
    },
};