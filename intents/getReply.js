const Context = require('../models/contextmodel.js');
const Intent = require('../models/intentmodel.js');

var reply = {
    name: 'getReply', 
    description: 'matching Wit response to database replies',
    execute: function(message, args) {

        let mood = "";
        let objective = "";
        let output = "";
        let replysent = false; // used for sending just one reply

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
                /**
                 * There might be multiple entities in the Wit response
                 * We want just the one matching the database
                 */
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
};

module.exports = reply;