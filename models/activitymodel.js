// file: ./models/contextmodel.js

/**
 * TYPE:
 * run
 * play (games, videogames, RPG...)
 * sports (tennis, football..)
 * chill
 * special
 */

 const mongoose = require("mongoose");

 const Schema = mongoose.Schema;
 
 // the schema for context
 const activitySchema = new Schema({
     type: String,
     activity: String
 });
 
 // model for activities
 module.exports = mongoose.model("activity", activitySchema);