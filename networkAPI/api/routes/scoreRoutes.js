/* jshint node: true */
'use strict';
module.exports = function(app) {
    var scoreControllerList = require('../controllers/scoreControllers');

    // controllerList Routes
    app.route('/scores')
        .get(scoreControllerList.list_all_scores)
        .post(scoreControllerList.create_a_score);


//   app.route('/scores/:networkId')
//     .get(networkControllerList.read_a_network)
//     .put(networkControllerList.update_a_network)
//     .delete(networkControllerList.delete_a_network);

    app.route('/scores/max')
        .get(scoreControllerList.get_max_score);
};