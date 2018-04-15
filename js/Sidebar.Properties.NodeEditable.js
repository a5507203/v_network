Sidebar.Properties.nodeEditable = function ( editor, object ) {

	var signals = editor.signals;
	var container = new UI.Row();
    var graphElement = object.graphElement;
	var coordinateRange = editor.coordinateRange;
	var coordinateMean = editor.coordinateMean;
    //name
    var objectNameRow = new UI.Row();
    var objectName = new UI.Text(graphElement.id);
    
	objectNameRow.add( new UI.Text( 'ID' ).setWidth( '90px' ) );
	objectNameRow.add( objectName );

	container.add( objectNameRow );



	// position

	var objectPositionRow = new UI.Row();
	var objectPositionX = new UI.Number(parseFloat(graphElement.orginalCoordinate.x)).setWidth( '50px' ).setStep(2/25*Config.coordinateRange).onChange(update);
	var objectPositionY = new UI.Number(parseFloat(graphElement.orginalCoordinate.y)).setWidth( '50px' ).setStep(2/25*Config.coordinateRange).onChange(update);


	objectPositionRow.add( new UI.Text( 'Position' ).setWidth( '90px' ) );
	objectPositionRow.add( objectPositionX,objectPositionY  );

	container.add( objectPositionRow );
	
	function update() {

		var object = editor.selected;

		if ( object !== null ) {
			var newX =  inverseToRealCoordinate(objectPositionX.getValue());
			var newY =	inverseToRealCoordinate(objectPositionY.getValue());


			var newPosition = new THREE.Vector3(newX, newY, 0 );
			
			if ( object.position.distanceTo(  newPosition ) >= 0.01 ) {
				console.log('setSuccess');
				editor.execute( new SetPositionCommand( object, newPosition, new THREE.Vector2(objectPositionX.getValue(),objectPositionY.getValue() ) ) );

			}
		}
	}


	signals.refreshSidebarObjectProperties.add( function ( object ) {

		if ( object !== editor.selected ) return;

		updateUI( object );

	} );


	function updateUI( object ) {


		objectPositionX.setValue( convertCoordinate(object.position.x) );
		objectPositionY.setValue( convertCoordinate(object.position.y) );
	
		// objectPositionX.setValue(  object.position.x);
		// objectPositionY.setValue(object.position.y );

	}




	return container;

};
