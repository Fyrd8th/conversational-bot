// file: ./models/intentmodel.js

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// the Schema for the nested response and requirements
const responseSchema = new Schema({
    rep: String,
    mood: String,
    obj: String
});

// the schema for intents
const intentSchema = new Schema({
    // note that the string needs to be an exact math of your Wit entity!
    id: String,
    res: [responseSchema]
});

// model for tasks
module.exports = mongoose.model("intent", intentSchema);