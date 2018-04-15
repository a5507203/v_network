Sidebar.Properties.nodeNotEditable = function ( editor, object ) {


	var signals = editor.signals;
	var container = new UI.Row();
    var graphElement = object.graphElement;

    //name
    var objectNameRow = new UI.Row();
    var objectName = new UI.Text(graphElement.id);
    
	objectNameRow.add( new UI.Text( 'ID' ).setWidth( '90px' ) );
	objectNameRow.add( objectName );

	container.add( objectNameRow );

	// position

	var objectPositionRow = new UI.Row();
	var objectPosition = new UI.Text('x:  '+ graphElement.orginalCoordinate.x+', y: '+graphElement.orginalCoordinate.y).setWidth( '190px' );

	objectPositionRow.add( new UI.Text( 'Coordinate' ).setWidth( '90px' ) );
	objectPositionRow.add( objectPosition );

	container.add( objectPositionRow );

	




	return container;

};
