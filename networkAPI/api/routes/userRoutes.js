/* jshint node: true */
'use strict';
module.exports = function(app) {
  var userControllerList = require('../controllers/userControllers');

  app.route('/users')
    .get(userControllerList.get_all_users);

  app.route('/admins/register')
    .post(userControllerList.create_a_admin);

  app.route('/users/register')
    .post(userControllerList.create_a_user);

  app.route('/users/login')
    .post(userControllerList.login);


};

