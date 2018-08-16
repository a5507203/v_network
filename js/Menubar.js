
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
	submit.onClick( function () {
		
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
			signals.readFlows.dispatch(res.flows);
			alert('congratulations, your score is '+ res.score);
	
        });
	} );
	container.add( submit );


	// container.add( new Menubar.Status( editor ) );
	var logOutButton = new UI.Button( 'log out' ).setRight();
	logOutButton.onClick( function () {
       signals.userLogin.dispatch(false);
	} );
	container.add (logOutButton );


	return container;

};