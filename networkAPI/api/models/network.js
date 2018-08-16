/* jshint node: true */
'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var NetworkSchema = new Schema({
    networkName: {
        type: String,
        required: 'Kindly enter the name of the task'
    },
    author: {
        type: Schema.ObjectId, 
        ref: 'User', 
        required: true
    },
    nodes: {
        type: String,
        required: 'kindly enter the nodes info'
    },
    links: {
        type: String,
        required: 'kindly enter the links info'
    },
    flows: {
        type: String
    },
    trips: {
        type: String,
        required: 'kindly enter the trips info'
    },
    level:{
        type: String,
        required: 'kindly enter a difficulty level',
        enum:['easy','medium','difficult']


    },
    score:{
        type:Number
    },
    linkAddedable:{
        type:Number,
        required: 'kindly enter if allow user to add link',
    },

    nodeMoveable:{
        type:Number,
        required: 'kindly enter if allow user to add link',
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
});



var Network = mongoose.model('Network', NetworkSchema);
module.exports = Network;

