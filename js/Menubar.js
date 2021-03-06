
var Menubar = function ( editor ) {
	var signals = editor.signals;
	var container = new UI.Panel();
	container.setId( 'menubar' );

	container.add( new Menubar.File( editor ) );
	// container.add( new Menubar.Edit( editor ) );
	// container.add( new Menubar.Add( editor ) );
	// container.add( new Menubar.Play( editor ) );
	// // container.add( new Menubar.View( editor ) );
	// container.add( new Menubar.Examples( editor ) );
	container.add( new Menubar.Help( editor ) );


	
	//SUBMIT
	var submitResultUrl = Config.host+'/scores';
	var submit = new UI.Button('Submit');
	submit.onClick( submitGraph );
	container.add( submit );


	// container.add( new Menubar.Status( editor ) );
	var logOutButton = new UI.Button( 'log out' ).setRight();
	logOutButton.onClick( function () {
		signals.clear.dispatch();
    	signals.userLogin.dispatch(false);
	} );
	container.add (logOutButton );
	
	function submitGraph() {
		editor.networkChanged = 0;
		
    	var graphContents = editor.graph.toCsv();
        userInfo = JSON.parse(getCookie('userInfo'));
     
		var networkInfo = {
			networkID: editor.currGame,
			userID:userInfo.id,
			nodes:graphContents.nodes,
			links:graphContents.edges,
			trips:graphContents.trips
		};
	
        httpPostAsync(submitResultUrl, networkInfo, function(res) {
			console.log(res);
			signals.readFlows.dispatch(res.flows);
		
			alert('TSTT is changed by '+ Math.round10(parseFloat(res.score),-2));
	
        });
	}

	return container;

};