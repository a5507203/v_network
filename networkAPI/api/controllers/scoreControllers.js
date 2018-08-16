/* jshint node: true */
'use strict';

var mongoose = require('mongoose'),
Score = mongoose.model('Score'),
Network = mongoose.model('Network');
var execFile = require('../execFile');


exports.list_all_scores = function(req, res) {
  Score.find({}, function(err, network) {
    res.json(network);
  });
};

// exports.list_all_networks_name_and_id = function(req, res) {
//     Network.find({},{_id:1, networkName:1},function(err, network){
//       res.json(network);
//     });
// };
var get_a_score_of_a_user = function(userID, networkID, callback){

    Score.findOne({userID: userID, networkID:networkID},callback);
};

exports.create_a_score = function(req, res) {

  execFile.getFlows(req.body,function(flows,curr_score){
      
      var userID = req.body.userID;
      var networkID = req.body.networkID;
      Network.findOne({_id:networkID},{_id:1, score:1},function(err, orginal_network_info){

        if (err) {console.log('err');res.json({score:0,flows:flows,stats:1});return err;}
        
        curr_score = orginal_network_info.score-curr_score;
        console.log(curr_score);
        var stats = 0;
        get_a_score_of_a_user(userID, networkID, function(err,pre_score_record){
        
          if (pre_score_record == null ){
            var new_score = new Score({userID:userID, networkID:networkID, score:curr_score});
            new_score.save(function(err, score) {
              if (err) console.log(err);
            });
            stats = 1;
          }

          else if(pre_score_record.score < curr_score ){
            Score.update(
            {userID:userID, networkID:networkID}, 
            {$set: {score: curr_score}}, 
            function(err, network) {
                if (err) console.log(err);
              });
            stats = 1;
          }
          // console.log(data);

          res.json({score:curr_score,flows:flows,stats:stats});
        });
      });
  });

};


exports.get_max_score = function(req, res) {
  
    Score.aggregate([{
        $group: {
            _id: { networkID: "$networkID" },
            maxscore: { $max: "$score" },
        }  
    }], function (err, result) {
      if (err) {
        console.log(err);
      }
        else{res.json(result);
      }
  });
};



