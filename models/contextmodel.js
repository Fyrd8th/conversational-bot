// file: ./models/contextmodel.js

/**
 * MOODS:
 * neutral
 * happy
 * sarcastic
 * sad
 * angry
 * baffled
 */

 /**
  * OBJECTIVES:
  * helpful
  * chaos
  */

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// the schema for context
const contextSchema = new Schema({
    name: String,
    mood: String,
    objective: String,
});

// model for tasks
module.exports = mongoose.model("context", contextSchema);