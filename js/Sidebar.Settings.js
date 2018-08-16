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

	
    var newGameList = new UI.Select().setWidth( '250px' ).onChange( function() {
		var currGame = newGameList.getValue();
		editor.currGame = currGame;
		console.log('getHere');
		for ( var maxScoreRecord of maxScores){
			if (maxScoreRecord._id.networkID == currGame) {
				maxScore.setValue(maxScoreRecord.maxscore);
			}
		}
        signals.loadDataUrl.dispatch( avaiableNetworksUrl + '/'+ currGame );
		// console.log(maxScores)
    } );

	signals.loadGameName.add(function(currGame){
		editor.currGame = currGame;
		newGameList.setValue(currGame);
	});

	newGameRow.add( new UI.Text( 'AVAIABLE GAMES' ));
	container.add( newGameRow );
	container.add( newGameList );
    // maxScore
    var maxScoreRow = new UI.Row();
    var maxScore = new UI.Text();
    
	maxScoreRow.add( new UI.Text( 'MAX SCORE:' ).setWidth( '90px' ) );
	maxScoreRow.add( maxScore );

    container.add( maxScoreRow );

	




    //container.add( newGameRow );



	function refeshUI(){
		var newGameOption = {};
		
		httpGetAsync(avaiableNetworksUrl, function(res){
			maxScores = res.maxScores;
			for( var network of res.networks ) {
				newGameOption[network._id] = network.networkName;
			}
			newGameList.setOptions( newGameOption );

		});


	}
	// var edgesVisibleRow = new UI.Row();
	// var edgesVisible = new UI.Checkbox().onChange( updateEdgesVisible ).setValue(true);

	// edgesVisibleRow.add( new UI.Text( 'Display Edges' ).setWidth( '120px' ) );
	// edgesVisibleRow.add( edgesVisible );

	// container.add( edgesVisibleRow );

	// var flowsVisibleRow = new UI.Row();
	// var flowsVisible = new UI.Checkbox().onChange( updateFlowsVisible );

	// flowsVisibleRow.add( new UI.Text( 'Display Flows' ).setWidth( '120px' ) );
	// flowsVisibleRow.add( flowsVisible );

	// container.add( flowsVisibleRow );



	// var gridVisibleRow = new UI.Row();
	// var gridVisible = new UI.Checkbox().onChange( updateGridVisible ).setValue(true);

	// gridVisibleRow.add( new UI.Text( 'Grid' ).setWidth( '120px' ) );
	// gridVisibleRow.add( gridVisible );

	// container.add( gridVisibleRow );


	// var capcityVisibleRow = new UI.Row();
	// var capcityVisible = new UI.Checkbox().onChange( updateCapcityVisible );

	// capcityVisibleRow.add( new UI.Text( 'Display Capcity' ).setWidth( '120px' ) );
	// capcityVisibleRow.add( capcityVisible );

	// container.add( capcityVisibleRow );

	/*
	var snapSize = new UI.Number( 25 ).setWidth( '40px' ).onChange( update );
	container.add( snapSize );
	var snap = new UI.THREE.Boolean( false, 'snap' ).onChange( update );
	container.add( snap );
	*/



	return container;

};