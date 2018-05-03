Sidebar.Properties = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setDisplay( 'none' );
	//var propertiesRow = new UI.Row();

	//propertiesRow.dom.style['text-align'] = 'center';

	//container.add( propertiesRow );


	container.add( new UI.Text( 'Properties' ).setTextTransform( 'uppercase' ) );
	

	container.add( new UI.Break(), new UI.Break() );


	var objectTypeRow = new UI.Row();
	var objectType = new UI.Text();

	objectTypeRow.add( new UI.Text( 'Type' ).setWidth( '90px' ) );
	objectTypeRow.add( objectType );

	container.add( objectTypeRow );


	var parameters = new UI.Span();
	container.add( parameters );


	signals.objectSelected.add(function(object){
		console.log('ui Selectd',object);
		object = editor.selected;
		
	
		if(!object || editor.addNewEdgeMode == 1) {

			container.setDisplay( 'none' );
		}
		else{

			container.setDisplay( '' );

			updateUI(object);
		}



	});


	signals.modeChanged.add(function( ){
		//object = editor.selected;
		editor.deselect();
		// if(!object) {

			container.setDisplay( 'none' );
		// }
		//else{

			// container.setDisplay( '' );

			// updateUI(object);
		//}



	});

	function updateUI( object ) {


		objectType.setValue(object.name);
		parameters.clear();

		var editable = 'NotEditable';
		if(editor.mode != 'AnimationMode'){
		// console.log( object.name+editor.mode)
	
			if (object.type == 0 ) editable = 'Editable';
		}
		parameters.add( new Sidebar.Properties[ object.name+editable ]( editor, object ) );
		

	
	}
	//



	//


	//

	// var object = new UI.Span().add(
	// 	new Sidebar.Object( editor )
	// );
	// container.add( object );

	// var geometry = new UI.Span().add(
	// 	new Sidebar.Geometry( editor )
	// );
	// container.add( geometry );

	// var material = new UI.Span().add(
	// 	new Sidebar.Material( editor )
	// );
	// container.add( material );

	// //

	// function select( section ) {

	// 	objectTab.setClass( '' );
	// 	geometryTab.setClass( '' );
	// 	materialTab.setClass( '' );

	// 	object.setDisplay( 'none' );
	// 	geometry.setDisplay( 'none' );
	// 	material.setDisplay( 'none' );

	// 	switch ( section ) {
	// 		case 'OBJECT':
	// 			objectTab.setClass( 'selected' );
	// 			object.setDisplay( '' );
	// 			break;
	// 		case 'GEOMETRY':
	// 			geometryTab.setClass( 'selected' );
	// 			geometry.setDisplay( '' );
	// 			break;
	// 		case 'MATERIAL':
	// 			materialTab.setClass( 'selected' );
	// 			material.setDisplay( '' );
	// 			break;
	// 	}

	// }

	// select( 'OBJECT' );

	return container;

};