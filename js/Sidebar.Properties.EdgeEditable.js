Sidebar.Properties.edgeEditable = function ( editor, object ) {

	var signals = editor.signals;
	var container = new UI.Row();
    var graphElement = object.graphElement;

    // b
    // freeFlowTime
    //   toll

  
    // type
    var roadTypeRow = new UI.Row();
    // TODO dinamically change options by road type, road orginal capacity
    var roadTypeOption = {};
    for (let [capacity,type] of Object.entries(Config.roadType) ){
        if (capacity >= graphElement.capacity )
            roadTypeOption[capacity] = type;
    }
    console.log(roadTypeOption,graphElement.capacity)
    var roadType = new UI.Select().setOptions( roadTypeOption ).setWidth( '150px' ).setValue(graphElement.modifiedCapacity).setFontSize( '12px' ).onChange( function() {
        
        editor.execute( new SetEdgeTypeCommand( object, roadType.getValue() ) );

       
    } );
    
	roadTypeRow.add( new UI.Text( 'Road Type' ).setWidth( '90px' ) );
	roadTypeRow.add( roadType );

    container.add( roadTypeRow );


    // capacity
    var capacityRow = new UI.Row();
    var capacity = new UI.Text(graphElement.modifiedCapacity);
    
	capacityRow.add( new UI.Text( 'Capacity' ).setWidth( '90px' ) );
	capacityRow.add( capacity );

    container.add( capacityRow );


    // length
    var lengthRow = new UI.Row();
    var length = new UI.Text(graphElement.length);
    
	lengthRow.add( new UI.Text( 'Road Length' ).setWidth( '90px' ) );
	lengthRow.add( length );

    container.add( lengthRow );
    
    // SpeedLimit
    var speedLimitRow = new UI.Row();
    var speedLimit = new UI.Text(graphElement.speedLimit);
    
	speedLimitRow.add( new UI.Text( 'Speed Limit' ).setWidth( '90px' ) );
	speedLimitRow.add( speedLimit );

    container.add( speedLimitRow );


    // Power
    var powerRow = new UI.Row();
    var power = new UI.Text(graphElement.power);
    
    powerRow.add( new UI.Text( 'Power' ).setWidth( '90px' ) );
    powerRow.add( power );

    container.add( powerRow );


    signals.refreshSidebarObjectProperties.add( function ( object ) {

		if ( object !== editor.selected ) return;

		updateUI( object );

	} );

    function updateUI( object ) {


		capacity.setValue( object.graphElement.modifiedCapacity );

		// objectPositionX.setValue(  object.position.x);
		// objectPositionY.setValue(object.position.y );

	}

	return container;

};
