
var SetPositionCommand = function ( object, newPosition, optionalOldPosition ) {

	Command.call( this );

	this.type = 'SetPositionCommand';
	this.name = 'Set Node '+object.graphElement.id+' Position';
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

		this.object.position.copy( this.newPosition );
	//	this.editor.signals.updateEdges.dispatch(this.object);
		this.object.graphElement.orginalCoordinate.copy(this.newNetworkPosition);
    	this.object.graphElement.coordinate.set(this.newPosition.x,this.newPosition.y);
		console.log(this.newPosition.x,this.newPosition.y);
		this.object.updateMatrixWorld( true );
		this.editor.signals.nodePositionChanging.dispatch( this.object );
		this.editor.signals.objectChanged.dispatch( this.object );

	},

	undo: function () {

		this.object.position.copy( this.oldPosition );
	//	this.editor.signals.updateEdges.dispatch(this.object);
	console.log("undo set position");
		this.object.graphElement.orginalCoordinate.copy(this.oldNetworkPosition);
    	this.object.graphElement.coordinate.set(this.oldPosition.x,this.oldPosition.y);
		this.object.updateMatrixWorld( true );
		this.editor.signals.nodePositionChanging.dispatch(this.object);
		this.editor.signals.objectChanged.dispatch( this.object );
		this.editor.select( this.object );

	},

	update: function ( command ) {

		this.newPosition.copy( command.newPosition );

	},

	toJSON: function () {

		var output = Command.prototype.toJSON.call( this );

		output.objectUuid = this.object.uuid;
		output.oldPosition = this.oldPosition.toArray();
		output.newPosition = this.newPosition.toArray();

		return output;

	},

	fromJSON: function ( json ) {

		Command.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.oldPosition = new THREE.Vector3().fromArray( json.oldPosition );
		this.newPosition = new THREE.Vector3().fromArray( json.newPosition );

	}

};