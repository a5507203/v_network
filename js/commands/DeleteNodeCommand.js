
var DeleteNodeCommand = function ( object ) {

	Command.call( this );

	this.type = 'RemoveObjectCommand';
	this.name = 'Remove Node';

	this.node = object;
	// this.outgoingEdges = object.graphElement.outgoingEdges;
	// this.incomingEdges = object.graphElement.incomingEdges;
	// this.parent = ( object !== undefined ) ? object.parent : undefined;

	// if ( this.parent !== undefined ) {

	// 	this.index = this.parent.children.indexOf( this.node );

	// }

};

DeleteNodeCommand.prototype = {

	execute: function () {

		this.editor.removeNode(this.node);

	},

	undo: function () {

		// var scope = this.editor;

		this.editor.addNode( this.node );

		this.editor.select( this.node );

	}

	// toJSON: function () {

	// 	var output = Command.prototype.toJSON.call( this );
	// 	output.object = this.object.toJSON();
	// 	output.index = this.index;
	// 	output.parentUuid = this.parent.uuid;

	// 	return output;

	// },

	// fromJSON: function ( json ) {

	// 	Command.prototype.fromJSON.call( this, json );

	// 	this.parent = this.editor.objectByUuid( json.parentUuid );
	// 	if ( this.parent === undefined ) {

	// 		this.parent = this.editor.scene;

	// 	}

	// 	this.index = json.index;

	// 	this.object = this.editor.objectByUuid( json.object.object.uuid );
	// 	if ( this.object === undefined ) {

	// 		var loader = new THREE.ObjectLoader();
	// 		this.object = loader.parse( json.object );

	// 	}

	// }

};