const Context = require('../models/contextmodel.js');

var context = {
    mood: "",
    objective: ""
}

Context.findOne({ name: character }) // which character's entities to get
    .exec()
    .then((result) => {
        //console.log(result);

        // save the current status of the character
        mood = result.mood;
        objective = result.objective;

        console.log(character + "'s mood is: " + mood + "\nand objective is: " + objective);
    })
    .catch(err => console.log(err));

module.exports = context;