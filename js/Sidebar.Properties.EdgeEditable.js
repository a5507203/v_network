Sidebar.Properties.linkEditable = function ( editor, object ) {

	var signals = editor.signals;
	var container = new UI.Row();
    var graphElement = object.graphElement;
    var currentRoadType = Config.roadTypes[graphElement.modifiedType];


    var roadTypeRow = new UI.Row();
    // TODO dinamically change options by road type, road orginal capacity
    var roadTypeOption = {};
    for (let [typeIndex,roadType] of Object.entries(Config.roadTypes) ){
        if (currentRoadType.capacity <= roadType.capacity )
            roadTypeOption[typeIndex] = roadType.name;
    }
  

    var roadType = new UI.Select().setOptions( roadTypeOption ).setWidth( '150px' ).setValue(graphElement.modifiedType).setFontSize( '12px' ).onChange( function() {
        editor.execute( new SetEdgeTypeCommand( object, roadType.getValue()) );
       
    } );
    
	roadTypeRow.add( new UI.Text( 'Road Type' ) );
	roadTypeRow.add( roadType );

    container.add( roadTypeRow );

    // Lane number
    
    var laneNoRow = new UI.Row();
    var laneNoOptions = createLaneNoOptions(currentRoadType.minLanes,currentRoadType.maxLanes);

    var laneNo = new UI.Select().setOptions(laneNoOptions).setWidth('50px').setValue(graphElement.modifiedNumberOfLanes).onChange(function(){
        // var newLaneNo = laneNo.getValue();

         editor.execute( new SetLaneNumberCommand( object, laneNo.getValue()) );
    });

	laneNoRow.add( new UI.Text( 'Number of Lanes' ).setWidth('140px') );
	laneNoRow.add( laneNo );
    container.add( laneNoRow );
    
    // capacity per lane
    var capacityPerLanesRow = new UI.Row();

    var capacityPerLanes = new UI.Text(currentRoadType.capacity);
	capacityPerLanesRow.add( new UI.Text( 'Capacity per Lane' ).setWidth('140px'));
	capacityPerLanesRow.add( capacityPerLanes );
    container.add( capacityPerLanesRow );

    // capacity
    var capacityRow = new UI.Row();
    var capacity = new UI.Text(getCapacity(graphElement.modifiedType, graphElement.modifiedNumberOfLanes));
	capacityRow.add( new UI.Text( 'Capacity' ).setWidth('140px') );
	capacityRow.add( capacity );
    container.add( capacityRow );


    // length
    var lengthRow = new UI.Row();
    var length = new UI.Text(graphElement.modifiedLength);
	lengthRow.add( new UI.Text( 'Road Length' ).setWidth('140px') );
	lengthRow.add( length );
    container.add( lengthRow );
    
    // SpeedLimit
    var speedLimitRow = new UI.Row();
    var speedLimit = new UI.Text(currentRoadType.speed);
	speedLimitRow.add( new UI.Text( 'Speed Limit' ).setWidth('140px'));
	speedLimitRow.add( speedLimit );
    container.add( speedLimitRow );

    // free flow time
    var freeFlowTimeRow = new UI.Row();
    var freeFlowTime = new UI.Text(getFreeFlow(graphElement.length, currentRoadType.speed));
	freeFlowTimeRow.add( new UI.Text( 'Free Flow Time' ).setWidth('140px') );
	freeFlowTimeRow.add( freeFlowTime );
    container.add( freeFlowTimeRow );


    // Power
    var powerRow = new UI.Row();
    var power = new UI.Text(graphElement.power);
    powerRow.add( new UI.Text( 'Beta' ).setWidth('140px') );
    powerRow.add( power );
    container.add( powerRow );

    // Power
    var bRow = new UI.Row();
    var b = new UI.Text(graphElement.b);
    bRow.add( new UI.Text( 'alpha' ).setWidth('140px') );
    bRow.add( b );
    container.add( bRow );


    // Construction Cost
    var constructionCostRow = new UI.Row();
    var constructionCost = new UI.Text(currentRoadType.constructionCost);
    constructionCostRow.add( new UI.Text( 'Construction Cost/km' ).setWidth('140px') );
    constructionCostRow.add(constructionCost );
    container.add( constructionCostRow );

    // Lane Adding Cost
    var laneAddingCostRow = new UI.Row();
    var laneAddingCost = new UI.Text(currentRoadType.laneAddingCost);
    laneAddingCostRow.add( new UI.Text( 'Lane Adding Cost/km' ).setWidth('140px'));
    laneAddingCostRow.add( laneAddingCost );
    container.add( laneAddingCostRow );

    // upgradeCost
    var upgradeCostRow = new UI.Row();
    var upgradeCost = new UI.Text(currentRoadType.upgradeCost);
    upgradeCostRow.add( new UI.Text( 'Upgrade Cost/km' ).setWidth('140px') );
    upgradeCostRow.add( upgradeCost );
    container.add( upgradeCostRow );


    signals.refreshSidebarObjectProperties.add( function ( object ) {


        if ( object != editor.selected || object.name == 'node' ) return;

		updateUI( object );

	} );

    function updateUI( object ) {
    
   
        var graphElement = object.graphElement;
        var currentRoadType = Config.roadTypes[graphElement.modifiedType];
       
        laneNo.setOptions(createLaneNoOptions(currentRoadType.minLanes,currentRoadType.maxLanes)).setValue(graphElement.modifiedNumberOfLanes);
        capacityPerLanes.setValue(currentRoadType.capacity);
        speedLimit.setValue(currentRoadType.speed);
        freeFlowTime.setValue(getFreeFlow(graphElement.length, currentRoadType.speed));
        constructionCost.setValue(currentRoadType.constructionCost);
        laneAddingCost.setValue(currentRoadType.laneAddingCost);
        upgradeCost.setValue(currentRoadType.upgradeCost);

		capacity.setValue(getCapacity(graphElement.modifiedType, graphElement.modifiedNumberOfLanes));
     
		// objectPositionX.setValue(  object.position.x);
		// objectPositionY.setValue(object.position.y );

	}

	return container;

};

function createLaneNoOptions(min,max){
    var laneNoOptions = {};
    for (var i = min ; i <= max; i+=1){
        laneNoOptions[i] = i;
    }
    return laneNoOptions;
}