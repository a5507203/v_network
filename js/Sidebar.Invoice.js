Sidebar.Invoice = function ( editor ) {

	var signals = editor.signals;
  
	var graph = editor.graph;

	var container = new UI.Panel();
	
	container.add( new UI.Text( 'BUDGET' ) );

	container.add( new UI.Break(), new UI.Break() );


	// outliner

	function buildOption(uuid, edgeObject, draggable ) {

		var option = document.createElement( 'div' );
		option.draggable = draggable;
		option.innerHTML = buildHTML( edgeObject );
		option.value = uuid;

		return option;

	}


	function buildHTML( edgeObject ) {
		var graphElement = edgeObject.graphElement;
		// var deltaCapacity = ( getCapacity(graphElement.modifiedType,graphElement.modifiedNumberOfLanes)-getCapacity(graphElement.type,graphElement.numberOfLanes) )*graphElement.length/1000000;
		var deltaCost = calculateCost(graphElement);
		Config.totalLeft -= deltaCost; 
		var html =  '&nbsp;Link&nbsp;from&nbsp;'+graph.nodes[edgeObject.from].name + '&nbsp;to&nbsp;' + graph.nodes[edgeObject.to].name + '&nbsp;with&nbsp;cost&nbsp;'+deltaCost;

		return html;

	}

	function calculateCost(edge){

		var deltaLanes = edge.modifiedNumberOfLanes - edge.numberOfLanes;
		var currRoadType = Config.roadTypes[edge.modifiedType];
		var upgradeCost = 0;
		var roadLen = edge.length;
		var modifiedRoadLen = edge.modifiedLength;
		// TODO addLaneCost can be negative or not
		var addLaneCost = (edge.modifiedNumberOfLanes - edge.numberOfLanes)*currRoadType.laneAddingCost*modifiedRoadLen;
		var lengthChangeCost = (modifiedRoadLen-roadLen)*currRoadType.constructionCost;
	
		if(addLaneCost < 0 ) addLaneCost = 0;
		if(lengthChangeCost < 0 ) lengthChangeCost = 0;
		
		if( edge.type == "none"){
			upgradeCost = currRoadType.constructionCost*modifiedRoadLen;
		}
	
		else if(edge.modifiedType != edge.type){

			var prevRoadType = Config.roadTypes[edge.type];
			upgradeCost = (currRoadType.constructionCost-prevRoadType.constructionCost)*roadLen;

		}
		

		return Math.round10((addLaneCost+upgradeCost+lengthChangeCost),-2);
		// return 1;
	}

	var outliner = new UI.Outliner( editor );
	outliner.setId( 'outliner' );
	outliner.onChange( function () {
		editor.select(editor.newEdgesDict[outliner.getValue()]);
		//console.log( editor.animations.animations[outliner.getValue() ]);
		

	} );

	container.add( outliner );
	container.add( new UI.Break() );

    var totalLeftRow = new UI.Row();
    var totalLeft = new UI.Text();
    
    totalLeftRow.add( new UI.Text( 'TOTAL LEFT:' ).setWidth( '90px' ) );
    totalLeftRow.add( totalLeft );

    container.add( totalLeftRow );




	// refreshUI
	var recursive = 1;
	function refreshUI() {
	

		var options = [];
		var pad = 0;
		Config.totalLeft = Config.budget;
	
		for ( let [uuid, edgeObject] of Object.entries((editor.newEdgesDict))) {
			
            var option = buildOption( uuid, edgeObject, false );
            option.style.paddingLeft = ( pad * 10 ) + 'px';
            options.push( option );
		
		}

		if(Config.totalLeft < 0 ){
			editor.undo();
		// 	recursive = 0;
			refreshUI();
		// 	options = [];
		// 	for ( let [uuid, edgeObject] of Object.entries((editor.newEdgesDict))) {
			
        //     option = buildOption( uuid, edgeObject, false );
        //     option.style.paddingLeft = ( pad * 10 ) + 'px';
        //     options.push( option );
		
		// }
		// 	recursive = 1;
			alert('Over budget!');
		}

		outliner.setOptions( options );
		totalLeft.setValue(Config.totalLeft);


	}
	signals.budgetChanged.add (refreshUI);
	signals.historyChanged.add( refreshUI );
	// signals.animationChanged.add( refreshUI );
	// signals.editorCleared.add( refreshUI );

	// signals.sceneGraphChanged.add( refreshUI );


	return container;

};