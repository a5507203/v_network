Sidebar.AddElements = function ( editor ) {

	

	var container = new UI.Panel();
	var signals = editor.signals;
	//title
	
	container.add( new UI.Text( 'Add Elements' ).setTextTransform( 'uppercase' ) );
	container.add( new UI.Break());
	var addNodeRow = new UI.Row();
	var addNodeButton = new UI.Button( 'Add Node' );
	addNodeButton.onClick( function () {

		signals.addNewNode.dispatch();

	} );
	addNodeRow.add(addNodeButton);
	container.add( addNodeRow );

	var addEdgeRow = new UI.Row();
	var addEdgeButton = new UI.Button( 'Add Link' );
	addEdgeButton.onClick( function () {
		addEdgeButton.dom.classList.add( 'selected' );
		signals.addNewEdgeStart.dispatch();
 
	} );
	signals.objectAdded.add(function(object) {
		if (object.name == 'edge')
			addEdgeButton.dom.classList.remove( 'selected' );
	});
	addEdgeRow.add( addEdgeButton );
	container.add( addEdgeRow );


	return container;

};
