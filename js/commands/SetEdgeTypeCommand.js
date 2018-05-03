var SetEdgeTypeCommand = function ( object, newCapacity ) {

	Command.call( this );

	this.type = 'SetCommand';
	this.name = 'Set Edge Type ' + type;
	// this.updatable = true;

	this.object = object;
	// this.attributeName = attributeName;
  
    this.oldCapacity = object.graphElement.capacity;
	this.newCapacity = newCapacity;


};

SetEdgeTypeCommand.prototype = {

	execute: function () {

        this.editor.setEdgeType(this.object, this.newCapacity);


	},

	undo: function () {
    
        this.editor.setEdgeType(this.object, this.oldCapacity);


	},

	update: function ( cmd ) {

		this.newValue = cmd.newValue;

	}

};