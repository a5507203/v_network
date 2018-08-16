/* jshint node: true */
'use strict';

var mongoose = require('mongoose'),
User = mongoose.model('User'),
Network = mongoose.model('Network'),
Score = mongoose.model('Score');

exports.get_all_users = function(req, res) {
  User.find({}, function(err, users) {
      res.json(users);
  });
  
  // var json = {networkID:"5af125c100ea54124c44f33d",userID:"5b02cc99c3f0d825d468d927",score:1231};
  // var newScore = new Score(json);
  // console.log(json)
  // newScore.save(function(err, data) {
  //   // if (err)
  //   //   res.send(err);
  //   // else 
  //       console.log(err);
  //   });

  
  Score.aggregate(  [{ $group: {
    _id: { networkID: "$networkID" },
    maxscore: { $max: "$score" },

  }}], function (err, result) {
      if (err) {
          console.log(err);
          return;
      }
      console.log(result);
  });
};


exports.create_a_user = function(req, res) {
  var new_user = new User(req.body);
  new_user.type = 2;
  new_user.save(function(err, user) {
    if (err)
      res.send(err);
    else {
        res.send({data:{user:{id:user._id,username:user.username,isAdmin:false}}, status:200 });
    }
  });
};

exports.create_a_admin = function(req, res) {
  var new_user = new User(req.body);
  new_user.type = 1;

  new_user.save(function(err, user) {
    if (err)
      res.send(err);
    else {
        res.send({data:{user:{id:user._id,username:user.username,isAdmin:true}}, status:200 });
    }
  });
};

exports.login = function(req, res) {
  User.authenticate(req.body.email, req.body.password, function (error, user) {
        if (error || !user) {

          res.send({data:{}, status:401 });
        } 
        else {
          var isAdmin = false;
          if(user.type != 2) isAdmin = true;
          res.send({data:{user:{id:user._id,username:user.username, isAdmin:isAdmin }}, status:200 });
     
        }
      });
};