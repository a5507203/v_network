/* jshint node: true */
'use strict';
module.exports = function(app) {
  var networkControllerList = require('../controllers/networkControllers');

  // controllerList Routes
  app.route('/networks')
    .get(networkControllerList.list_all_networks)
    .post(networkControllerList.create_a_network);


  app.route('/networks/:networkId')
    .get(networkControllerList.read_a_network)
    .put(networkControllerList.update_a_network)
    .delete(networkControllerList.delete_a_network);

  // app.route('/networks/result')
  //   .post(networkControllerList.get_result);
};
