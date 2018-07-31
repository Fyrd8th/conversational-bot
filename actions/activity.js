const Activity = require('../models/activitymodel.js');

module.exports = {
    getActivity(message, type) {
        Activity.findOne({ type: type })
            .select('activity')
            .exec()
            .then((response) => {
                return message.reply(response.activity);
            })
            .catch(err => {
                console.log(err);
                return message.reply("You know what, nevermind.");
            });
    }
};