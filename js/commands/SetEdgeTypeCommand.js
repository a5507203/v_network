var SetEdgeTypeCommand = function ( object, newTypeName ) {

	Command.call( this );

	this.type = 'SetCommand';
	this.name = 'Set Link Type ' + newTypeName;
	// this.updatable = true;

	this.object = object;
	// this.attributeName = attributeName;
	        // var numberOfLanes = currentRoadType.numberOfLanes;
	this.oldRoadTypeName = object.graphElement.type;
	this.oldNumberOfLanes = object.graphElement.modifiedNumberOfLanes;

	this.newRoadTypeName = newTypeName;

	var newRoadType = Config.roadTypes[this.newRoadTypeName];
	
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