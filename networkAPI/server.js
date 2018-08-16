var cors = require('cors');
var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  mongoose = require('mongoose'),
  Network = require('./api/models/network'), //created model loading here
  User = require('./api/models/user'), //created model loading here
  Score = require('./api/models/score'), //created model loading here
  bodyParser = require('body-parser');
  
// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/vnetwork'); 
mongoose.connection.once('open',function(){
  console.log('db connection success');
}).on('error',function(error){
  console.log(error);
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// routes
//network routes
var networkRoutes = require('./api/routes/networkRoutes');
networkRoutes(app); 
//user routes
var userRoutes = require('./api/routes/userRoutes'); 
userRoutes(app); 

var scoreRoutes = require('./api/routes/scoreRoutes'); 
scoreRoutes(app); 

app.listen(port);


app.use(function(req, res) {
  res.status(404).send({ url: req.originalUrl + ' url not found'});
});
console.log('todo list RESTful API server started on: ' + port);
