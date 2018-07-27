// file: ./models/contextmodel.js

/**
 * MOODS:
 * neutral: 1
 * happy: 2
 * sarcastic: 3
 * sad: 4
 * angry: 5
 * baffled: 6
 */

 /**
  * OBJECTIVES:
  * helpful: 1
  * chaos:
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