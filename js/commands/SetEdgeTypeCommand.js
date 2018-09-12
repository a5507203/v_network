var SetEdgeTypeCommand = function ( object, newTypeName ) {

	Command.call( this );

	this.type = 'SetCommand';
	this.name = 'Set Link Type ' + newTypeName;
	// this.updatable = true;

	this.object = object;
	
	// previous road type and number of lanes
	this.oldRoadTypeName = object.graphElement.modifiedType;
	this.oldNumberOfLanes = object.graphElement.modifiedNumberOfLanes;
	// new road type
	this.newRoadTypeName = newTypeName;
	

	var newRoadType = Config.roadTypes[this.newRoadTypeName];
	
	// check old #lanes whether smaller or larger than new #lanes
	if ( this.oldNumberOfLanes < newRoadType.minLanes ) {
		this.newNumberOfLanes = newRoadType.minLanes;
		this.name +=' and Lane number to ' + this.newNumberOfLanes;
	}

	else if ( this.oldNumberOfLanes > newRoadType.maxLanes ) { 
		this.newNumberOfLanes = newRoadType.maxLanes;
		this.name +=' and Lane number to ' + this.newNumberOfLanes;
	}
	else {
		this.newNumberOfLanes = this.oldNumberOfLanes;
	}
	
 

};

SetEdgeTypeCommand.prototype = {

	execute: function () {

        this.editor.setEdgeType(this.object, this.newRoadTypeName, this.newNumberOfLanes);


	},

	undo: function () {
    
        this.editor.setEdgeType(this.object, this.oldRoadTypeName, this.oldNumberOfLanes);


	},

	update: function ( cmd ) {

		this.newRoadTypeName = cmd.newNumberOfLanes;

	}

};