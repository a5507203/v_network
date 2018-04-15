/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Settings = function ( editor ) {

	var config = editor.config;
	var signals = editor.signals;

	var container = new UI.Panel();
	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );
	container.setPaddingBottom( '20px' );



	var edgesVisibleRow = new UI.Row();
	var edgesVisible = new UI.Checkbox().onChange( updateEdgesVisible ).setValue(true);

	edgesVisibleRow.add( new UI.Text( 'Display Edges' ).setWidth( '120px' ) );
	edgesVisibleRow.add( edgesVisible );

	container.add( edgesVisibleRow );

	var flowsVisibleRow = new UI.Row();
	var flowsVisible = new UI.Checkbox().onChange( updateFlowsVisible );

	flowsVisibleRow.add( new UI.Text( 'Display Flows' ).setWidth( '120px' ) );
	flowsVisibleRow.add( flowsVisible );

	container.add( flowsVisibleRow );



	var gridVisibleRow = new UI.Row();
	var gridVisible = new UI.Checkbox().onChange( updateGridVisible ).setValue(true);

	gridVisibleRow.add( new UI.Text( 'Grid' ).setWidth( '120px' ) );
	gridVisibleRow.add( gridVisible );

	container.add( gridVisibleRow );


	var capcityVisibleRow = new UI.Row();
	var capcityVisible = new UI.Checkbox().onChange( updateCapcityVisible );

	capcityVisibleRow.add( new UI.Text( 'Display Capcity' ).setWidth( '120px' ) );
	capcityVisibleRow.add( capcityVisible );

	container.add( capcityVisibleRow );

	/*
	var snapSize = new UI.Number( 25 ).setWidth( '40px' ).onChange( update );
	container.add( snapSize );
	var snap = new UI.THREE.Boolean( false, 'snap' ).onChange( update );
	container.add( snap );
	*/

	function updateGridVisible() {

		signals.showGridChanged.dispatch( gridVisible.getValue() );

		// signals.snapChanged.dispatch( snap.getValue() === true ? snapSize.getValue() : null );

	}

	function updateFlowsVisible() {

		signals.showFlowsChanged.dispatch( flowsVisible.getValue() );

		// signals.snapChanged.dispatch( snap.getValue() === true ? snapSize.getValue() : null );

	}

	function updateCapcityVisible() {

		signals.showLabelsChanged.dispatch( capcityVisible.getValue() );

		// signals.snapChanged.dispatch( snap.getValue() === true ? snapSize.getValue() : null );

	}
	function updateEdgesVisible() {

		signals.showEdgesChanged.dispatch( edgesVisible.getValue() );

		// signals.snapChanged.dispatch( snap.getValue() === true ? snapSize.getValue() : null );

	}

	return container;

};