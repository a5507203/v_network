var SetLaneNumberCommand = function ( object, newLaneNumber ) {

	Command.call( this );

	this.type = 'SetCommand';
	this.name = 'Set number of lanes to ' + newLaneNumber;
	// this.updatable = true;
	// this.updatable = true;

	this.object = object;

	this.oldNumberOfLanes = object.graphElement.modifiedNumberOfLanes;
	this.newNumberOfLanes = newLaneNumber;

	
 

};

SetLaneNumberCommand.prototype = {

	execute: function () {

        this.editor.setLaneNumber(this.object, this.newNumberOfLanes);


	},

	undo: function () {
    
        this.editor.setLaneNumber(this.object, this.oldNumberOfLanes);


	},

	update: function ( cmd ) {

		this.newNumberOfLanes = cmd.newNumberOfLanes;

	}

};