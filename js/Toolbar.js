
var Toolbar = function ( editor ) {

	var signals = editor.signals;
	
	var container = new UI.Panel();
	container.setId( 'toolbar' );

	var buttons = new UI.Panel();
	container.add( buttons );

	// showEdges / showFlows / scale

	var showEdges = new UI.Button( 'Network' );
	showEdges.dom.classList.add( 'selected' );
	showEdges.onClick( function () {
       updateGraphElementDisplay( 0 );
	} );
	buttons.add( showEdges );

	var showFlows = new UI.Button( 'Traffic Flow' );
	showFlows.onClick( function () {
        updateGraphElementDisplay( 1 );
	} );
	buttons.add( showFlows );

	var showTrips = new UI.Button( 'Desire Lines' );
	showTrips.onClick( function () {
        updateGraphElementDisplay( 2 );
	} );
	buttons.add( showTrips );


	function updateGraphElementDisplay ( type ) {

		var currButton = showEdges;
		if( type == 1 ) {
			currButton = showFlows;
		}
		else if( type == 2 ) {
			currButton = showTrips;
		}
		console.log(currButton.dom.classList);
		if (currButton.dom.classList.contains('selected')) {
			currButton.dom.classList.remove( 'selected' );
			signals.networkElementDisplayChanged.dispatch( type, false );
		}
		else {
			currButton.dom.classList.add( 'selected' );
			signals.networkElementDisplayChanged.dispatch( type, true );
		}

	}

	return container;

};


