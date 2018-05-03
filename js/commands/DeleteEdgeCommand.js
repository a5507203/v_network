
var DeleteEdgeCommand = function ( object ) {

	Command.call( this );

	this.type = 'RemoveObjectCommand';
	this.name = 'Remove Edge';

	this.edge = object;

};

DeleteEdgeCommand.prototype = {

	execute: function () {

		this.editor.removeEdge( this.edge );

	},

	undo: function () {

		this.editor.addEdge( this.edge );
		this.editor.select( this.edge );

	}

};