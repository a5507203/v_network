/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Settings = function ( editor ) {

	var config = editor.config;
	var signals = editor.signals;
	var avaiableNetworksUrl = Config.host+'/networks';
	var container = new UI.Panel();
	var maxScores = null;
	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );
	container.setPaddingBottom( '20px' );
    signals.userLogin.add(function( bool ){

      if( bool ) refeshUI();
    });

	//TODO, sort by difficulty level

	//avaiable games
	var newGameRow = new UI.Row();

	
    var newGameList = Config.newGameList = new UI.Select().setWidth( '250px' ).onChange( function() {
		var currGame = newGameList.getValue();
		// editor.currGame = currGame;

		var loadGame = function(){
			editor.currGame = currGame;
			newGameList.setValue(currGame);
			for ( var maxScoreRecord of maxScores){
				if (maxScoreRecord._id.networkID == currGame) {
					maxScore.setValue(maxScoreRecord.maxscore);
				}
			}
			signals.loadDataUrl.dispatch( avaiableNetworksUrl + '/'+ currGame );
			signals.editorCleared.remove(loadGame);

		};
		
		signals.editorCleared.add(loadGame);
		signals.clear.dispatch();

		// console.log(maxScores)
    } );

	signals.loadGameName.add(function(currGame){
		// if(editor.currGame != '')

		editor.currGame = currGame;
		newGameList.setValue(currGame);
	});

	// signals.clear.add(function(){

	// 	refeshUI();
	// });

	newGameRow.add( new UI.Text( 'AVAIABLE GAMES' ));
	container.add( newGameRow );
	container.add( newGameList );
    // maxScore
    var maxScoreRow = new UI.Row();
    var maxScore = new UI.Text();
    
	maxScoreRow.add( new UI.Text( 'MAX SCORE:' ).setWidth( '90px' ) );
	maxScoreRow.add( maxScore );

    container.add( maxScoreRow );


 	var deleteButtonRow = new UI.Row();
	var deleteButton = new UI.Button('Delete Game');
	deleteButton.onClick( function () {
		var networkId = editor.currGame;
		if(networkId == '') return;
		if ( confirm( 'Do you want to delete this game?' ) ) {
			httpDeleteAsync(avaiableNetworksUrl + '/'+ networkId,function(res){
				//console.log(res);	
				//if(res.status == 200) {
				alert('a game has been deleted');
				signals.clear.dispatch();
				//}
			});
		}
		refeshUI();

	} );
	deleteButtonRow.add(deleteButton);

	container.add( deleteButtonRow );

	signals.isAdmin.add(function(bool){

		if(bool) deleteButtonRow.setDisplay( '' );
		else deleteButtonRow.setDisplay( 'none' );
		
	});


	signals.publishGraph.add(function(id){
		refeshUI();
		editor.currGame = id;
		newGameList.setValue(id);
	});

	function refeshUI(){
		var newGameOption = {};
		
		httpGetAsync(avaiableNetworksUrl, function(res){
			maxScores = res.maxScores;
			for( var network of res.networks ) {
				newGameOption[network._id] = network.networkName;
			}
			newGameList.setOptions( newGameOption ).setValue();

		});


	}


	return container;

};