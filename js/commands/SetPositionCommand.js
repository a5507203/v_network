
var SetPositionCommand = function ( object, newPosition, optionalOldPosition ) {

	Command.call( this );

	this.type = 'SetPositionCommand';
	this.name = 'Set Node '+object.graphElement.name+' Position';
	this.updatable = true;

    this.object = object;


	if ( object !== undefined && newPosition !== undefined ) {

		this.oldPosition = object.position.clone();
		this.newPosition = newPosition.clone();
	
	}

	if ( optionalOldPosition !== undefined ) {

		this.oldPosition = optionalOldPosition.clone();

	}
	this.newNetworkPosition = new THREE.Vector2(convertCoordinate(this.newPosition.x),convertCoordinate(this.newPosition.y));
	this.oldNetworkPosition = new THREE.Vector2(convertCoordinate(this.oldPosition.x),convertCoordinate(this.oldPosition.y));
	

	

};

SetPositionCommand.prototype = {

	execute: function () {

		this.editor.setNodePosition( this.object, this.newPosition, this.newNetworkPosition );
	},

	undo: function () {
		console.log();
		console.log('asdfas',this.oldPosition);
		this.editor.setNodePosition( this.object, this.oldPosition, this.oldNetworkPosition );
	},

	update: function ( command ) {
		console.log('update',command.newPosition);
		this.newPosition.copy( command.newPosition );
		this.newNetworkPosition.copy( command.newNetworkPosition );

	},

	// toJSON: function () {

	// 	var output = Command.prototype.toJSON.call( this );

	// 	output.objectUuid = this.object.uuid;
	// 	output.oldPosition = this.oldPosition.toArray();
	// 	output.newPosition = this.newPosition.toArray();

	// 	return output;

	// },

	// fromJSON: function ( json ) {

	// 	Command.prototype.fromJSON.call( this, json );

	// 	this.object = this.editor.objectByUuid( json.objectUuid );
	// 	this.oldPosition = new THREE.Vector3().fromArray( json.oldPosition );
	// 	this.newPosition = new THREE.Vector3().fromArray( json.newPosition );

	// }

};