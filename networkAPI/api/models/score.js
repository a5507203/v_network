
/* jshint node: true */
'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ScoreSchema = new Schema({
  // _id:{
  //   type:String,
  //   unique:true
  // },

  userID: {
      type: Schema.ObjectId, 
      ref: 'User', 
      required: true
  },

  networkID: {
      type: Schema.ObjectId, 
      ref: 'Network', 
      required: true
  },


  score: {
    type: Number,
    required: true,
  }
});

ScoreSchema.index({userID:1, networkID:1}, { unique: true });


var Score = mongoose.model('Score', ScoreSchema);
module.exports = Score;
