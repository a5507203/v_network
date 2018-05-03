Sidebar.Invoice = function ( editor ) {

	var signals = editor.signals;
    var newEdgesDict = editor.newEdgesDict;
	var graph = editor.graph;

	var container = new UI.Panel();
	
	container.add( new UI.Text( 'INVOICE' ) );


	container.add( new UI.Break(), new UI.Break() );


	// outliner

	function buildOption(uuid, edge, draggable ) {

		var option = document.createElement( 'div' );
		option.draggable = draggable;
		option.innerHTML = buildHTML( edge );
		option.value = uuid;

		return option;

	}


	function buildHTML( edge ) {
		var deltaCapacity = edge.graphElement.modifiedCapacity - edge.graphElement.capacity;
		Config.totalLeft -= deltaCapacity; 
		var html =  '&nbsp;Edge&nbsp;from&nbsp;'+graph.nodes[edge.from].name + '&nbsp;to&nbsp;' + graph.nodes[edge.to].name + '&nbsp;with&nbsp;capacity&nbsp;'+deltaCapacity;

		return html;

	}



	var outliner = new UI.Outliner( editor );
	outliner.setId( 'outliner' );
	outliner.onChange( function () {
		editor.select(newEdgesDict[outliner.getValue()]);
		//console.log( editor.animations.animations[outliner.getValue() ]);
		

	} );

	container.add( outliner );
	container.add( new UI.Break() );

    var totalLeftRow = new UI.Row();
    var totalLeft = new UI.Text(Config.totalLeft);
    
    totalLeftRow.add( new UI.Text( 'TOTAL LEFT:' ).setWidth( '90px' ) );
    totalLeftRow.add( totalLeft );

    container.add( totalLeftRow );




	// refreshUI

	function refreshUI() {

		var options = [];
		var pad = 0;
		Config.totalLeft = Config.maxLengthAdd;
		for ( let [uuid, edge] of Object.entries((newEdgesDict))) {
		
            var option = buildOption( uuid, edge, false );
            option.style.paddingLeft = ( pad * 10 ) + 'px';
            options.push( option );
		
		}

		outliner.setOptions( options );
		totalLeft.setValue(Config.totalLeft);


	}

	signals.historyChanged.add( refreshUI );
	// signals.animationChanged.add( refreshUI );
	// signals.editorCleared.add( refreshUI );

	// signals.sceneGraphChanged.add( refreshUI );


	return container;

};