
var AddEdgeCommand = function ( object ) {

	Command.call( this );
	this.type = 'AddObjectCommand';

	this.object = object;
	if ( object !== undefined ) {
		this.name = 'Add New Link';
	}

};

AddEdgeCommand.prototype = {

	execute: function ( ) {

		this.editor.addEdge( this.object );
		this.editor.select( this.object );
	
	},

	undo: function () {

		this.editor.removeEdge( this.object );
		this.editor.deselect();

	},

	toJSON: function () {

		var output = Command.prototype.toJSON.call( this );
		output.object = this.object.toJSON();

		return output;

	},

	fromJSON: function ( json ) {

		Command.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.object.object.uuid );

		if ( this.object === undefined ) {

			var loader = new THREE.ObjectLoader();
			this.object = loader.parse( json.object );

		}

	}

};
