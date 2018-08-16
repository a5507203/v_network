Sidebar.AddElements = function ( editor ) {

	

	var container = new UI.Panel();
	var signals = editor.signals;
	//title
	
	container.add( new UI.Text( 'Add Elements' ).setTextTransform( 'uppercase' ) );
	container.add( new UI.Break(),new UI.Break());
	var addElementRow = new UI.Row();

	var addNodeButton = new UI.Button( 'Add Node' ).setWidth( '90px' ) ;
	addNodeButton.onClick( function () {

		signals.addNewNode.dispatch();

	} );
	
	container.add( addElementRow );


	var addEdgeButton = new UI.Button( 'Add Link' ).setWidth( '90px' ).setMarginLeft( '20px' ) ;
	addEdgeButton.onClick( function () {
		if (addEdgeButton.dom.classList.contains('selected')) {
			addEdgeButton.dom.classList.remove( 'selected' );
			signals.addNewEdgeEnd.dispatch();
		}
		else{
			addEdgeButton.dom.classList.add( 'selected' );
			signals.addNewEdgeStart.dispatch();
		}
 
	} );
	signals.addNewEdgeEnd.add(function(object) {
			addEdgeButton.dom.classList.remove( 'selected' );
	});

	signals.edgeNodeOption.add(function(linkOption, nodeOption){
		
		addElementRow.clear();

		if (nodeOption == 1) {
			addElementRow.add(addNodeButton);

		}
		if( linkOption == 1){
			addElementRow.add( addEdgeButton );
		}
	});

	



	return container;

};
