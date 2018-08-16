/* jshint node: true */
'use strict';

var mongoose = require('mongoose'),
Score = mongoose.model('Score'),
Network = mongoose.model('Network');
var execFile = require('../execFile');


var query_max_score = function(callback){
  Score.aggregate([{
    $group: {
        _id: { networkID: "$networkID" },
        maxscore: { $max: "$score" },
    }  
  }],callback);
};


exports.list_all_networks = function(req, res) {
  Network.find({},{_id:1, networkName:1}, function(err, networks) {


    query_max_score(function(err, maxScores) {
      res.json({networks:networks,maxScores:maxScores});
    });
  });
};




// exports.list_all_networks_name_and_id = function(req, res) {
//     Network.find({},{_id:1, networkName:1},function(err, network){
//       res.json(network);
//     });
// };

exports.create_a_network = function(req, res) {

  var new_network = new Network(req.body);
  execFile.getFlows(new_network,function(flows,curr_score){

    new_network.flows = flows;
    new_network.score = curr_score;
    new_network.save(function(err, network) {
      if (err) res.send(err);
      res.json(network);
    });
  });
};


exports.read_a_network = function(req, res) {
 
  Network.findById(req.params.networkId, function(err, network) {
    if (err)
      res.send(err);
    res.json(network);
  });
};


exports.update_a_network = function(req, res) {
  Network.findOneAndUpdate({_id: req.params.networkId}, req.body, {new: true}, function(err, network) {
    if (err)
      res.send(err);
    res.json(network);
  });
};




exports.delete_a_network = function(req, res) {

  Network.remove({
    _id: req.params.networkId
  }, function(err, network) {
    if (err)
      res.send(err);
    res.json({ message: 'Network successfully deleted' });
  });
};

exports.get_result = function(req, res) {
  //var new_network = new Network(req.body);

  res.json({network:{}});
};

