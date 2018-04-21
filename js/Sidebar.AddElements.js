Sidebar.AddElements = function ( editor ) {

	

	var container = new UI.Panel();
	var signals = editor.signals;

	//propertiesRow.dom.style['text-align'] = 'center';
	// title 
	container.add( new UI.Text( 'Add Elements' ).setTextTransform( 'uppercase' ) );
	container.add( new UI.Break(), new UI.Break() );
	var addNodeRow = new UI.Row();
	var addNodeButton = new UI.Button( 'Add New Node' );
	addNodeButton.onClick( function () {

		signals.addNewNode.dispatch();

	} );
	addNodeRow.add(addNodeButton);
	container.add( addNodeRow );

	var addEdgeRow = new UI.Row();
	var addEdgeButton = new UI.Button( 'Add New Edge' );
	addEdgeButton.onClick( function () {
 
	} );
	addEdgeRow.add( addEdgeButton );
	container.add( addEdgeRow );

	//propertiesRow.add( new UI.Text( 'Properties' ).setTextTransform( 'uppercase' ) );

	return container;

};
